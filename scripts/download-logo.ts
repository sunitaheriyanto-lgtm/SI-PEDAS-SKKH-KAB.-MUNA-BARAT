import fs from "fs";
import path from "path";

async function downloadAndSave() {
  const apiUri = "https://commons.wikimedia.org/w/api.php?action=query&titles=File:Lambang_Kabupaten_Muna_Barat.png&prop=imageinfo&iiprop=url&format=json";
  
  console.log("Querying MediaWiki API for Muna Barat Emblem...");
  try {
    const apiRes = await fetch(apiUri, {
      headers: {
        "User-Agent": "SiPedasApp/1.0 (sunitaheriyanto@gmail.com)"
      }
    });
    
    if (!apiRes.ok) {
      throw new Error(`MediaWiki API returned status ${apiRes.status}`);
    }
    
    const apiData: any = await apiRes.json();
    const pages = apiData?.query?.pages;
    if (!pages) throw new Error("No pages found in MediaWiki response");
    
    const pageId = Object.keys(pages)[0];
    const imageInfo = pages[pageId]?.imageinfo?.[0];
    const originalUrl = imageInfo?.url;
    
    if (!originalUrl) {
      throw new Error("No image URL found in imageinfo. Let's check search results.");
    }
    
    console.log("Resolved original logo URL from MediaWiki API:", originalUrl);
    
    // Now request it
    const res = await fetch(originalUrl, {
      headers: {
        "User-Agent": "SiPedasApp/1.0 (sunitaheriyanto@gmail.com)"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to download image from API URL: ${res.statusText}`);
    }
    
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64}`;
    
    const outputPath = path.resolve("src/components/MubarLogoData.ts");
    const fileContent = `// Base64 Muna Barat PNG Logo from MediaWiki API to bypass CORS/hotlinking blocks
export const mubarLogoBase64 = "${dataUrl}";
`;
    
    fs.writeFileSync(outputPath, fileContent);
    console.log("Successfully saved Base64 logo to", outputPath);
  } catch (err: any) {
    console.error("MediaWiki API workflow failed:", err.message);
    
    // Secondary fallback search query in API
    try {
      console.log("Trying search query API...");
      const searchApi = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=Lambang+Muna+Barat&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json";
      const searchRes = await fetch(searchApi, {
        headers: { "User-Agent": "SiPedasApp/1.0 (sunitaheriyanto@gmail.com)" }
      });
      const searchData: any = await searchRes.json();
      const pages = searchData?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const originalUrl = pages[pageId]?.imageinfo?.[0]?.url;
        if (originalUrl) {
          console.log("Found URL via search API:", originalUrl);
          const res = await fetch(originalUrl, {
            headers: { "User-Agent": "SiPedasApp/1.0 (sunitaheriyanto@gmail.com)" }
          });
          if (res.ok) {
            const buffer = await res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const dataUrl = `data:image/png;base64,${base64}`;
            const outputPath = path.resolve("src/components/MubarLogoData.ts");
            fs.writeFileSync(outputPath, `// Base64 Muna Barat Logo
export const mubarLogoBase64 = "${dataUrl}";
`);
            console.log("Saved base64 from search API URL to", outputPath);
            return;
          }
        }
      }
    } catch (searchErr: any) {
      console.error("Search API failed:", searchErr.message);
    }
    
    // Write empty fallback
    const outputPath = path.resolve("src/components/MubarLogoData.ts");
    fs.writeFileSync(outputPath, `// Fallback empty logo
export const mubarLogoBase64 = "";
`);
  }
}

downloadAndSave();
