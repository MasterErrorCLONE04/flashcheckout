import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { evolutionClient } from '@/lib/whatsapp/evolution';

export const dynamic = 'force-dynamic';

// GET: Check connection status and get QR code if not connected
export async function GET() {
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

    if (!store.whatsappInstanceName) {
      return NextResponse.json({ status: 'DISCONNECTED' });
    }

    // Consult connection status / retrieve QR code
    try {
      const qrData = await evolutionClient.getQR(store.whatsappInstanceName);
      
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
    } catch (err: any) {
      console.error('[Instance GET status error]', err);
      return NextResponse.json({ status: 'DISCONNECTED', error: err.message });
    }

  } catch (err: any) {
    console.error('[API Instance GET Error]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
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
      await evolutionClient.createInstance(instanceName);
    } catch (err: any) {
      // If it already exists, that is fine, we continue
      console.log(`[Instance POST] Instance ${instanceName} may already exist, proceeding.`);
    }

    // 3. Configure webhook
    try {
      await evolutionClient.setWebhook(instanceName);
    } catch (err: any) {
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

  } catch (err: any) {
    console.error('[API Instance POST Error]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
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

  } catch (err: any) {
    console.error('[API Instance DELETE Error]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function disconnectStoreInstance(store: any) {
  // Update database immediately
  await prisma.store.update({
    where: { id: store.id },
    data: {
      whatsappInstanceName: null,
      whatsappConnected: false
    }
  });

  // Call Evolution API delete in the background (no await) since logging out from WhatsApp can be very slow
  if (store.whatsappInstanceName) {
    evolutionClient.deleteInstance(store.whatsappInstanceName).catch((err) => {
      console.error('[disconnectStoreInstance background cleanup failed]', err);
    });
  }

  return NextResponse.json({ success: true, status: 'DISCONNECTED' });
}
