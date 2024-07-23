import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import Jimp from "jimp";
import { put } from "@vercel/blob";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

interface UploadResponse {
  path: string;
  name: string;
}

async function compressDirectory(
  sourceDir: string,
  outPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // 设置压缩级别
    });

    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log(
        "Archiver has been finalized and the output file descriptor has closed."
      );
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(sourceDir, false);

    archive.finalize();
  });
}

// 处理单个图片：裁剪周围的透明像素
async function processImage(buff: Buffer): Promise<Buffer> {
  const image = await Jimp.read(buff); // 读取图片
  let minX = image.bitmap.width;
  let minY = image.bitmap.height;
  let maxX = 0;
  let maxY = 0;

  // 扫描图片找到非透明像素的边界
  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    function (x, y, idx) {
      const alpha = this.bitmap.data[idx + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  );

  // 如果找到非透明区域，裁剪图片
  if (minX < maxX && minY < maxY) {
    return await image
      .crop(minX, minY, maxX - minX + 1, maxY - minY + 1)
      .getBufferAsync(Jimp.MIME_PNG);
  }

  return image.getBufferAsync(Jimp.MIME_PNG);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files: FormDataEntryValue[] = formData.getAll("files");

  const downloadUrls = [];

  for (let file of files) {
    file = file as File;
    // 如果不是png图片则下一个
    if (file.type !== "image/png") {
      continue;
    }
    /**
     * 上传完毕返回的数据结构
     * {
          url: 'https://8mzgpvppmhdosnhr.public.blob.vercel-storage.com/12e534292.14eb8_2-Pmn1N4qhqimgIYreYkP1k6Bm3TXTou.png',
          downloadUrl: 'https://8mzgpvppmhdosnhr.public.blob.vercel-storage.com/12e534292.14eb8_2-Pmn1N4qhqimgIYreYkP1k6Bm3TXTou.png?download=1',
          pathname: '12e534292.14eb8_2.png',
          contentType: 'image/png',
          contentDisposition: 'inline; filename="12e534292.14eb8_2.png"'
        }
     */

    // 把file转换成buffer存起来
    const arrayBuff = await file.arrayBuffer();
    const processImageBuffer = Buffer.from(arrayBuff);
    const processedBuffer = await processImage(processImageBuffer);

    const blob = await put(file.name, processedBuffer, { access: "public" });
    console.log("blob upload completed", blob);
    downloadUrls.push({
      url: blob.downloadUrl,
      showName:
        file.name.length > 20 ? file.name.slice(0, 17) + "..." : file.name,
      name: file.name,
    });
  }

  return new NextResponse(JSON.stringify({ downloadUrls }), { status: 200 });
}
