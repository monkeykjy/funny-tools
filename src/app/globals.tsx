// app/globals.js
import Script from "next/script";

export function globals() {
  return (
    <>
      {/* 其他全局样式或脚本 */}

      {/* 百度统计代码 */}
      <Script
        id="baidu_tongji"
        // strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _hmt = _hmt || [];
            (function() {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?14b3cfd5d594fa99849d21e56e6db925";
              var s = document.getElementsByTagName("script")[0]; 
              s.parentNode.insertBefore(hm, s);
            })();
          `,
        }}
      />
    </>
  );
}
