import padStart from 'lodash/padStart';

function pad(number) {
  return padStart(number, 2, '0');
}

export const toChTag = (seconds) => {
  let left = seconds;
  const h = Math.floor((left / 3600));
  left -= h * 3600;
  const m = Math.floor((left / 60));
  left -= m * 60;
  const s = Math.floor(left);

  let output = `${s}秒`;

  if (m) {
    output = `${m}分${output}`;
  }
  if (h) {
    if (!m) {
      output = `0分${output}`;
    }
    output = `${h}小時${output}`;
  }

  return output;
};

export const toTag = (seconds) => {
  let left = seconds;
  const h = Math.floor((left / 3600));
  left -= h * 3600;
  const m = Math.floor((left / 60));
  left -= m * 60;
  const s = Math.floor(left);

  return `${h}:${m}:${s}`.split(':').map(v => pad(v)).join(':');
};

export const toSeconds = (tagStr) => {
  const buf = tagStr.split(/:/);

  let h = 0;
  let m = 0;
  let s = 0;

  if (buf.length === 3) {
    h = Number(buf[0]);
    m = Number(buf[1]);
    s = Number(buf[2]);
  }
  else if (buf.length === 2) {
    m = Number(buf[0]);
    s = Number(buf[1]);
  }
  else if (buf.length === 1) {
    s = Number(buf[0]);
  }

  return (h * 3600) + (m * 60) + s;
};
