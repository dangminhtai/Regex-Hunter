
import { LevelData } from "../types";

// Định nghĩa bộ đề cơ bản (Raw Regex chưa có ^ $)
// Candidates bao gồm: Chuỗi khớp hoàn toàn, chuỗi khớp một phần, chuỗi không khớp
export const STATIC_LEVELS: (Omit<LevelData, 'regex'> & { rawRegex: string, difficulty: number })[] = [
  // --- Mức ĐỘ DỄ (1-3) ---
  {
    difficulty: 1,
    rawRegex: "\\d{3}",
    description: "Tìm chuỗi có 3 chữ số liền nhau",
    candidates: ["123", "abc-999", "Số 000", "a12b", "12", "1-2-3", "9999", "Test 555 Test", "NoDigit", "---", "007", "42"]
  },
  {
    difficulty: 1,
    rawRegex: "[A-Z]{3}",
    description: "Tìm chuỗi có 3 chữ cái IN HOA liền nhau",
    candidates: ["ABC", "xXYZ", "Abc", "A-B-C", "123", "TEST", "Ha Noi", "USA", "V N", "uuu", "ABC1", "BBC"]
  },
  {
    difficulty: 2,
    rawRegex: "cat|dog",
    description: "Chứa từ 'cat' hoặc 'dog'",
    candidates: ["cat", "dog", "scat", "doggy", "bird", "ca t", "do g", "category", "hotdog", "cut", "dig", "fish"]
  },
  {
    difficulty: 2,
    rawRegex: "[a-z]+_[0-9]+",
    description: "Chữ thường, dấu gạch dưới, rồi đến số",
    candidates: ["user_123", "test_0", "abc_99", "User_1", "abc-123", "test_", "_123", "abc_def", "123_abc", "no_match", "onlytext", "user_123456"]
  },
  {
    difficulty: 3,
    rawRegex: "#[0-9A-F]{3}",
    description: "Mã màu Hex ngắn (Dấu thăng + 3 ký tự Hex)",
    candidates: ["#FFF", "#A09", "#abc", "FFF", "#G00", "#12", "#1234", "Color #ABC", "#000", "#F0F", "#XYZ", "1#23"]
  },

  // --- Mức ĐỘ TRUNG BÌNH (4-6) ---
  {
    difficulty: 4,
    rawRegex: "\\d{2}/\\d{2}/\\d{4}",
    description: "Ngày tháng năm (dd/mm/yyyy)",
    candidates: ["01/01/2024", "31/12/1999", "1/1/2024", "99/99/2022", "12-12-2022", "2024/01/01", "05/05/20", "Text 01/01/2024", "No date", "12/34/5678", "15/08/1945", "02/09/1945"]
  },
  {
    difficulty: 5,
    rawRegex: "user\\d+@mail\\.com",
    description: "Email user + số @mail.com",
    candidates: ["user123@mail.com", "user@mail.com", "user99@mail.vn", "admin@mail.com", "user1@gmail.com", "user007@mail.com", "User1@mail.com", "user123@mail.common", "u1@mail.com", "@mail.com", "mail.com", "hey user1@mail.com"]
  },
  {
    difficulty: 5,
    rawRegex: "[A-Z][a-z]+ [A-Z][a-z]+",
    description: "Tên người (2 từ, viết hoa chữ cái đầu)",
    candidates: ["John Doe", "Ha Noi", "tom cruise", "Mr Bean", "Java Script", "visual Basic", "ABC DEF", "John", "Doe", "Elon Musk", "Bill gates", "Steve Jobs"]
  },
  {
    difficulty: 6,
    rawRegex: "\\b(https?://)\\w+\\.\\w+",
    description: "URL đơn giản bắt đầu bằng http hoặc https",
    candidates: ["https://google.com", "http://vnexpress.net", "www.com", "ftp://files.com", "https://site", "http:// abc.com", "https://test.vn", "click https://a.com", "http//bad.com", "abcd.com", "https://domain.org", "http://s"]
  },

  // --- Mức ĐỘ KHÓ (7+) ---
  {
    difficulty: 7,
    rawRegex: "^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.",
    description: "Phần đầu của địa chỉ IPv4 (0-255 + dấu chấm)",
    candidates: ["192.", "255.", "0.", "256.", "1.", "999.", "25.", "123.", "abc.", "10.", "300.", "192.168"]
  },
  {
    difficulty: 8,
    rawRegex: "(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}",
    description: "Password mạnh: >8 ký tự, có số, chữ thường, chữ hoa (Lookahead)",
    candidates: ["Pass1234", "admin123", "PASSWORD123", "passwords", "StrongP@ss1", "Aa123456", "Short1A", "onlyletters", "12345678", "P1a2s3s4", "WeakPass", "GoodPass1"]
  },
  {
    difficulty: 8,
    rawRegex: "<([a-z]+)>.*<\\/\\1>",
    description: "Thẻ HTML đóng mở khớp nhau (Backreference)",
    candidates: ["<div>Content</div>", "<p>Hello</p>", "<b>Bold</b>", "<div>Wrong</p>", "<br>", "<DIV>Case</DIV>", "<span>Text</span>", "<a>Link</a>", "<1>Num</1>", "<x>y</z>", "<test></test>", "<>Empty</>"]
  }
];
