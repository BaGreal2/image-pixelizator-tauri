export const urlToFile = async (
	url: string,
	filename: string,
	mimeType: string,
) => {
	if (url.startsWith('data:')) {
		const arr = url.split(',');
		const mime = arr[0].match(/:(.*?);/)![1];
		const bstr = atob(arr[arr.length - 1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		const file = new File([u8arr], filename, { type: mime || mimeType });
		return Promise.resolve(file);
	}
	const res = await fetch(url);
	const buf = await res.arrayBuffer();
	return new File([buf], filename, { type: mimeType });
};
