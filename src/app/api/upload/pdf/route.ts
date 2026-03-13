import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        // Only allow PDF files
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Sadece PDF dosyaları yüklenebilir' }, { status: 400 });
        }

        // Max 50MB
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'Dosya boyutu 50MB\'ı aşamaz' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'pdf');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const uniqueName = `${uuidv4()}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        const url = `/uploads/pdf/${uniqueName}`;

        return NextResponse.json({
            url,
            filename: file.name,
            size: file.size,
        });
    } catch (error) {
        console.error('PDF upload error:', error);
        return NextResponse.json({ error: 'Dosya yüklenirken hata oluştu' }, { status: 500 });
    }
}
