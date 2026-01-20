export function fromCode(str = "") {
  // 定义密钥，36个字母和数字
  const key = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l = key.length; // 获取密钥的长度
  let b;
  let b1;
  let b2;
  let b3;
  let d = 0;
  let s; // 定义临时变量
  s = new Array(Math.floor(str.length / 3)); // 计算加密字符串包含的字符数，并定义数组
  b = s.length; // 获取数组的长度
  for (let i = 0; i < b; i++) {
    // 以数组的长度循环次数，遍历加密字符串
    b1 = key.indexOf(str.charAt(d)); // 截取周期内第一个字符串，计算在密钥中的下标值
    d++;
    b2 = key.indexOf(str.charAt(d)); // 截取周期内第二个字符串，计算在密钥中的下标值
    d++;
    b3 = key.indexOf(str.charAt(d)); // 截取周期内第三个字符串，计算在密钥中的下标值
    d++;
    s[i] = b1 * l * l + b2 * l + b3; // 利用下标值，反推被加密字符的Unicode编码值
  }
  b = eval(`String.fromCharCode(${s.join(",")})`);
  return b; // 返回被解密的字符串
}

export function timestampToDate(timestamp: number): string {
  let date = new Date(timestamp);
  let year = date.getFullYear();
  let month = date.getMonth() + 1; // 月份从0开始，需要加1
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
