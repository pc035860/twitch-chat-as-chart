import '_libs/DOMParser';

export default function createDocument(htmlOrBody) {
  return (new DOMParser()).parseFromString(htmlOrBody, 'text/html');
}
