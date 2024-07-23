import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs-extra";
import path from "path";
import archiver from "archiver";
import Jimp from "jimp";

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
async function processImage(path: string, outputPath: string): Promise<string> {
  const image = await Jimp.read(path); // 读取图片
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
    await image
      .crop(minX, minY, maxX - minX + 1, maxY - minY + 1)
      .writeAsync(outputPath);
  }
  // 没有找到非透明区域，直接拷贝
  else {
    fs.copyFileSync(path, outputPath);
  }

  return outputPath;
}

export async function POST(req: NextRequest) {
  const processedDirectories: UploadResponse[] = [];
  const formData = await req.formData();
  const files: FormDataEntryValue[] = formData.getAll("files");
  const uuid = uuidv4();
  const dir = path.join(process.cwd(), "public", "uploads", uuid);
  fs.ensureDirSync(dir);

  for (let file of files) {
    file = file as File;
    const filePath = path.join(dir, file.name);
    processedDirectories.push({
      path: filePath,
      name: file.name,
    });

    // 把file转换成buffer存起来
    const arrayBuff = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuff));
  }
  const processedDir = path.join(dir, "processed");

  await fs.ensureDir(processedDir);

  // 模拟图片处理过程，将上传的文件复制到处理后的目录
  for (let file of processedDirectories) {
    // file = file as File;
    const targetPath = path.join(processedDir, file.name);
    await processImage(file.path, targetPath);
  }

  // 创建 zip 文件
  let zipUrl = `/uploads/${uuid}/processed.zip`;
  const zipPath = path.join(dir, "processed.zip");
  try {
    await compressDirectory(processedDir, zipPath);
  } catch {
    zipUrl = "";
  }

  return new NextResponse(
    JSON.stringify({
      downloadUrls: processedDirectories.map((file) => {
        return {
          // 返回file.name，如果name长度大于20，则截取前17个字符加上...
          name:
            file.name.length > 20 ? file.name.slice(0, 17) + "..." : file.name,
          url: `/uploads/${uuid}/processed/${file.name}`,
        };
      }),
      zipUrl,
    }),
    { status: 200 }
  );
}
