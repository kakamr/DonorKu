import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

type DataSertifikat = {
  nomor_sertifikat: string;
  nama_lengkap: string;
  tanggal_donor: Date;
  lokasi: string;
  volume_ml: number | null;
  golongan_darah: string;
};

export async function buatPdfSertifikat(data: DataSertifikat): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 420]); // A5 landscape kira-kira

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const merah = rgb(0.86, 0.15, 0.15);
  const hitam = rgb(0.1, 0.1, 0.1);
  const abu = rgb(0.4, 0.4, 0.4);

  page.drawRectangle({
    x: 10,
    y: 10,
    width: 575,
    height: 400,
    borderColor: merah,
    borderWidth: 2,
  });

  page.drawText("SERTIFIKAT APRESIASI DONOR DARAH", {
    x: 90,
    y: 340,
    size: 20,
    font: fontBold,
    color: merah,
  });

  page.drawText("Diberikan dengan bangga kepada:", {
    x: 200,
    y: 300,
    size: 11,
    font: fontRegular,
    color: abu,
  });

  page.drawText(data.nama_lengkap, {
    x: 595 / 2 - (fontBold.widthOfTextAtSize(data.nama_lengkap, 22) / 2),
    y: 265,
    size: 22,
    font: fontBold,
    color: hitam,
  });

  const tanggalFormatted = data.tanggal_donor.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  page.drawText(`Tanggal: ${tanggalFormatted}    Lokasi: ${data.lokasi}`, {
    x: 90,
    y: 225,
    size: 11,
    font: fontRegular,
    color: hitam,
  });

  page.drawText(
    `Golongan Darah: ${data.golongan_darah}    Volume: ${data.volume_ml ?? "-"}ml`,
    { x: 90, y: 205, size: 11, font: fontRegular, color: hitam }
  );

  page.drawText(`No. Sertifikat: ${data.nomor_sertifikat}`, {
    x: 90,
    y: 50,
    size: 9,
    font: fontRegular,
    color: abu,
  });

  const pdfBytes = await pdfDoc.save();

  const namaFile = `${data.nomor_sertifikat.replace(/\//g, "-")}.pdf`;
  const relativePath = `/uploads/sertifikat/${namaFile}`;
  const fullPath = path.join(process.cwd(), "public", relativePath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, pdfBytes);

  return relativePath;
}