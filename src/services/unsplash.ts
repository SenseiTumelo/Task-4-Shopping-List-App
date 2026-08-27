export type UnsplashItemImage = {
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
};

export async function findItemImage(
  query: string,
): Promise<UnsplashItemImage | undefined> {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

  if (!accessKey) return undefined;

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query,
      )}&per_page=1&client_id=${accessKey}`,
    );

    if (!response.ok) return undefined;

    const data = await response.json();
    const photo = data.results?.[0];

    if (!photo) return undefined;

    return {
      imageUrl: `${photo.urls.small}&w=600&h=400&fit=crop`,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    };
  } catch {
    return undefined;
  }
}