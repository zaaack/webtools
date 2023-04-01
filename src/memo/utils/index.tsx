export function toText(html: string) {
  return html.replace(/<[^>]+>/g, "");
}

export function pngBase64ToBlob(urlData: string) {
try {
  var arr = urlData.split(","),
    mime = arr[0].match(/:(.*?);/)?.[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });

} catch (error) {
  return new Blob([])
}
}
