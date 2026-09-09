import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    if (order.user.toString() !== auth.user._id!.toString() && auth.user.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }
    if (!order.isPaid) {
      return NextResponse.json({ message: 'Invoice is only available for paid orders' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const draw = (text: string, x: number, size = 11, useFont = font) => {
      page.drawText(text, { x, y, size, font: useFont, color: rgb(0.1, 0.1, 0.1) });
    };

    draw('INVOICE', 50, 22, bold); y -= 30;
    draw(`Order ID: ${order._id}`, 50); y -= 16;
    draw(`Date: ${new Date(order.paidAt || order.createdAt).toLocaleDateString()}`, 50); y -= 16;
    draw(`Status: ${order.status}`, 50); y -= 30;

    draw('Bill To:', 50, 12, bold); y -= 16;
    draw(order.shippingAddress.fullName, 50); y -= 14;
    draw(order.shippingAddress.address, 50); y -= 14;
    draw(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 50); y -= 14;
    draw(order.shippingAddress.country, 50); y -= 30;

    draw('Item', 50, 11, bold);
    draw('Qty', 320, 11, bold);
    draw('Price', 400, 11, bold);
    draw('Total', 480, 11, bold);
    y -= 18;

    for (const item of order.items) {
      draw(item.name, 50);
      draw(String(item.quantity), 320);
      draw(`$${item.price.toFixed(2)}`, 400);
      draw(`$${(item.price * item.quantity).toFixed(2)}`, 480);
      y -= 16;
    }

    y -= 10;
    draw('Total Paid:', 400, 12, bold);
    draw(`$${order.totalPrice.toFixed(2)}`, 480, 12, bold);

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order._id}.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}