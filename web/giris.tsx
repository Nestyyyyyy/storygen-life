/* GitHub Pages sürümünün girişi: sunucu yok, her şey tarayıcıda.
   Yapay zekâ, oyuncunun ayarlar panelinden girdiği kendi anahtarıyla çalışır. */

import { createRoot } from "react-dom/client";
import HayatZeka from "@/components/HayatZeka";

createRoot(document.getElementById("oyun")!).render(<HayatZeka />);
