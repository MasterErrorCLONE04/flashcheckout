import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { evolutionClient } from '@/lib/whatsapp/evolution';
import { getErrorMessage } from '@/lib/api/route-utils';

export const dynamic = 'force-dynamic';

async function forceRecreateInstance(instanceName: string) {
  try {
    console.log(`[Instance Recreate] Deleting instance ${instanceName} first...`);
    await evolutionClient.deleteInstance(instanceName).catch(() => {});
    console.log(`[Instance Recreate] Waiting 2.5 seconds for deletion to complete...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
  } catch (e) {
    console.warn(`[Instance Recreate] Ignored error while deleting instance:`, e);
  }
  console.log(`[Instance Recreate] Creating instance ${instanceName}...`);
  await evolutionClient.createInstance(instanceName);
}

type WhatsAppStore = {
  id: string;
  whatsappInstanceName: string | null;
  whatsappConnected: boolean;
};

// GET: Check connection status and get QR code if not connected
export async function GET() {
  console.log('[Instance GET] Handler started');
  try {
    const { userId } = await auth();
    console.log('[Instance GET] authenticated userId:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      console.log('[Instance GET] Store not found for user');
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    console.log('[Instance GET] Store found:', store.id, 'instanceName:', store.whatsappInstanceName);

    if (!store.whatsappInstanceName) {
      return NextResponse.json({ status: 'DISCONNECTED' });
    }

    // Consult connection status / retrieve QR code
    try {
      let qrData;
      try {
        qrData = await evolutionClient.getQR(store.whatsappInstanceName);
      } catch (err: any) {
        const errMsg = getErrorMessage(err);
        if (errMsg.toLowerCase().includes('does not exist') || errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('in use')) {
          console.log(`[Instance GET] Instance ${store.whatsappInstanceName} does not exist or is in conflict in Evolution API. Re-creating...`);
          try {
            await forceRecreateInstance(store.whatsappInstanceName);
            try {
              await evolutionClient.setWebhook(store.whatsappInstanceName);
            } catch (webhookErr) {
              console.error('[Instance GET] Failed to set webhook on re-creation', webhookErr);
            }
            qrData = await evolutionClient.getQR(store.whatsappInstanceName);
          } catch (createErr) {
            console.error('[Instance GET] Failed to auto-recreate instance', createErr);
            throw err;
          }
        } else {
          throw err;
        }
      }
      
      if (qrData.status === 'CONNECTED') {
        if (!store.whatsappConnected) {
          await prisma.store.update({
            where: { id: store.id },
            data: { whatsappConnected: true }
          });
        }
        return NextResponse.json({ status: 'CONNECTED', connected: true });
      }

      return NextResponse.json({
        status: 'QRCODE',
        code: qrData.code,
        base64: qrData.base64,
        qr: qrData.base64,
        connected: false
      });
    } catch (err: unknown) {
      console.error('[Instance GET status error]', err);
      return NextResponse.json({ status: 'DISCONNECTED', error: getErrorMessage(err) });
    }

  } catch (err: unknown) {
    console.error('[API Instance GET Error]', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

// POST: Connect/Create instance
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'connect';

    if (action === 'disconnect') {
      return disconnectStoreInstance(store);
    }

    // Standard Action: Connect / Create Instance
    // Define unique instance name using store slug (or id)
    const instanceName = `store_${store.id}`;

    // 1. Save instance name to DB
    await prisma.store.update({
      where: { id: store.id },
      data: { whatsappInstanceName: instanceName, whatsappConnected: false }
    });

    // 2. Register instance in Evolution API
    try {
      await forceRecreateInstance(instanceName);
    } catch (err: unknown) {
      console.error(`[Instance POST] Failed to force-recreate instance ${instanceName}`, err);
    }

    // 3. Configure webhook
    try {
      await evolutionClient.setWebhook(instanceName);
    } catch (err: unknown) {
      console.error('[Instance POST] Failed to set webhook', err);
    }

    // 4. Retrieve QR code
    const qrData = await evolutionClient.getQR(instanceName);
    return NextResponse.json({
      status: qrData.status,
      code: qrData.code,
      base64: qrData.base64,
      qr: qrData.base64,
      connected: qrData.status === 'CONNECTED'
    });

  } catch (err: unknown) {
    console.error('[API Instance POST Error]', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

// DELETE: Disconnect and delete instance
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return disconnectStoreInstance(store);

  } catch (err: unknown) {
    console.error('[API Instance DELETE Error]', err);
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

async function disconnectStoreInstance(store: WhatsAppStore) {
  // Update database immediately
  await prisma.store.update({
    where: { id: store.id },
    data: {
      whatsappInstanceName: null,
      whatsappConnected: false
    }
  });

  // Clear previous WhatsApp sessions in the database for this store to prevent mixed conversations
  await prisma.whatsAppSession.deleteMany({
    where: { storeId: store.id }
  }).catch((err) => {
    console.error('[disconnectStoreInstance] Failed to delete old sessions:', err);
  });

  // Call Evolution API delete in the background (no await) since logging out from WhatsApp can be very slow
  if (store.whatsappInstanceName) {
    evolutionClient.deleteInstance(store.whatsappInstanceName).catch((err) => {
      console.error('[disconnectStoreInstance background cleanup failed]', err);
    });
  }

  return NextResponse.json({ success: true, status: 'DISCONNECTED' });
}
