import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import type {
  AlanOneriSaglayici,
  IsimOneriSaglayici,
  OneriSaglayici,
  ProfilSaglayici,
  SahneSaglayici,
  SerbestCevapSaglayici,
} from "@/components/HayatOyunu";
import HayatZeka from "@/components/HayatZeka";
import {
  aiDurumu,
  alanOner,
  isimOner,
  oneriGetir,
  profilCoz,
  sahneGetir,
  serbestCevap,
} from "@/lib/hayat.functions";

export const Route = createFileRoute("/hayat")({
  head: () => ({
    meta: [
      { title: "Hayat Simülatörü — Bir hayat, sayısız yol" },
      {
        name: "description",
        content:
          "Karakterini yarat, hedefini seç ve bebeklikten yaşlılığa bir ömrü yaşa. Sahneleri yapay zekâ yazar, kararlarında akıl hocan yanında.",
      },
      { property: "og:title", content: "Hayat Simülatörü" },
      {
        property: "og:description",
        content:
          "Her oynayışta farklı bir hayat: yaşına uygun olaylar, kalıcı ilişkiler ve yapay zekâ önerileri.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  /* Sunucuda anahtar var mı? Durum çubuğu buna göre "açık/kapalı" yazar. */
  loader: async () => {
    try {
      return await aiDurumu();
    } catch {
      return { aktif: false };
    }
  },
  component: HayatSayfasi,
});

function HayatSayfasi() {
  const { aktif } = Route.useLoaderData();

  /* Sunucu tarafındaki yapay zekâ sağlayıcıları. Oyuncu kendi anahtarını
     girerse HayatZeka bunların yerine tarayıcı istemcisini kullanır. */
  const sahne = useCallback<SahneSaglayici>(
    ({ durum, sonKaliplar, kacinilanBasliklar }) =>
      sahneGetir({ data: { durum, sonKaliplar, kacinilanBasliklar, yapayZeka: true } }),
    [],
  );
  const oneri = useCallback<OneriSaglayici>(
    ({ durum, olay }) =>
      oneriGetir({
        data: {
          durum,
          olay: {
            id: olay.id,
            baslik: olay.baslik,
            metin: olay.metin,
            secenekler: olay.secenekler,
          },
          yapayZeka: true,
        },
      }),
    [],
  );
  const alanOneri = useCallback<AlanOneriSaglayici>(
    ({ tur, ipucu, kacinilan }) => alanOner({ data: { tur, ipucu, kacinilan } }),
    [],
  );
  const isimOneri = useCallback<IsimOneriSaglayici>(
    ({ cinsiyet, kacinilan }) => isimOner({ data: { cinsiyet, kacinilan } }),
    [],
  );
  const profil = useCallback<ProfilSaglayici>(
    ({ ad, tur }) => profilCoz({ data: { ad, tur } }),
    [],
  );
  const serbest = useCallback<SerbestCevapSaglayici>(
    ({ durum, olay, metin }) =>
      serbestCevap({
        data: {
          durum,
          olay: {
            id: olay.id,
            baslik: olay.baslik,
            metin: olay.metin,
            secenekler: olay.secenekler,
          },
          metin,
          yapayZeka: true,
        },
      }),
    [],
  );

  const sunucu = useMemo(
    () => ({ sahne, oneri, alanOneri, isimOneri, profil, serbestCevap: serbest }),
    [sahne, oneri, alanOneri, isimOneri, profil, serbest],
  );

  return <HayatZeka sunucu={sunucu} sunucuZekaVar={aktif} />;
}
