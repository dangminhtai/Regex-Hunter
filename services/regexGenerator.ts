// REGEX GENERATOR ENGINE
// Core logic để sinh Regex và Test Strings theo cấu trúc

type PatternType = 'digit' | 'word' | 'upper' | 'lower' | 'hex' | 'specific';

interface RegexComponent {
    source: string; // Chuỗi regex, vd: \d
    gen: () => string; // Hàm sinh chuỗi đúng, vd: "5"
    fake: () => string; // Hàm sinh chuỗi sai kiểu data, vd: "a"
}

// 1. ATOMS: Các thành phần cơ bản
const ATOMS: Record<PatternType, RegexComponent> = {
    digit: {
        source: "\\d",
        gen: () => Math.floor(Math.random() * 10).toString(),
        fake: () => String.fromCharCode(97 + Math.floor(Math.random() * 26)) // Trả về chữ thường
    },
    upper: {
        source: "[A-Z]",
        gen: () => String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        fake: () => Math.floor(Math.random() * 10).toString() // Trả về số
    },
    lower: {
        source: "[a-z]",
        gen: () => String.fromCharCode(97 + Math.floor(Math.random() * 26)),
        fake: () => String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Trả về chữ hoa
    },
    word: {
        source: "\\w",
        gen: () => {
            const set = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
            return set[Math.floor(Math.random() * set.length)];
        },
        fake: () => ["-", "@", ".", "!", " "][Math.floor(Math.random() * 5)] // Ký tự đặc biệt
    },
    hex: {
        source: "[0-9A-F]",
        gen: () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)],
        fake: () => "GHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 20)] // Ký tự không phải hex
    },
    specific: {
        source: "abc", // Placeholder, sẽ được override
        gen: () => "abc",
        fake: () => "xyz"
    }
};

// Hàm tiện ích
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 2. BUILDERS: Lắp ráp Atom thành Pattern phức tạp

interface GeneratedPattern {
    regex: string;
    generateMatch: () => string;
    generateWrong: () => string;
}

// Sinh một phân đoạn (Segment)
// Vd: \d{3}, [A-Z]+, a|b
const createSegment = (difficulty: number): GeneratedPattern => {
    // Độ khó càng cao, càng dùng nhiều loại atom phức tạp
    const types: PatternType[] = difficulty <= 2 
        ? ['digit', 'upper'] 
        : difficulty <= 5 
            ? ['digit', 'upper', 'lower', 'hex']
            : ['digit', 'upper', 'lower', 'word', 'hex'];

    const type = pick(types);
    const atom = ATOMS[type];
    
    // Xử lý Quantifier (Số lượng)
    // Diff 1: Fixed length (3)
    // Diff > 3: Range {2,4} or +
    let quant = "";
    let min = 1, max = 1;
    
    const quantRoll = Math.random();
    
    if (difficulty === 1) {
        min = 3; max = 3; quant = "{3}";
    } else if (quantRoll < 0.4) {
        min = rnd(2, 4); max = min; quant = `{${min}}`;
    } else if (quantRoll < 0.7 && difficulty > 2) {
        min = 2; max = 4; quant = `{${min},${max}}`;
    } else if (difficulty > 4) {
        min = 1; max = 5; quant = "+";
    } else {
        min = 1; max = 1; quant = "";
    }

    return {
        regex: atom.source + quant,
        generateMatch: () => {
            let s = "";
            const len = quant === "+" ? rnd(1, 5) : rnd(min, max);
            for(let i=0; i<len; i++) s += atom.gen();
            return s;
        },
        generateWrong: () => {
            // Cách làm sai 1: Sai độ dài (nếu quantifier cố định)
            if (min === max && min > 1 && Math.random() > 0.5) {
                let s = "";
                // Tạo chuỗi ngắn hơn hoặc dài hơn
                const len = Math.random() > 0.5 ? min - 1 : min + 1;
                for(let i=0; i<len; i++) s += atom.gen();
                return s;
            }
            // Cách làm sai 2: Sai nội dung (đúng độ dài nhưng sai loại ký tự)
            let s = "";
            const len = quant === "+" ? rnd(1, 5) : rnd(min, max);
            
            // Chèn ít nhất 1 ký tự sai vào vị trí ngẫu nhiên
            const badPos = Math.floor(Math.random() * len);
            for(let i=0; i<len; i++) {
                s += (i === badPos) ? atom.fake() : atom.gen();
            }
            return s;
        }
    };
};

// 3. COMPOSER: Kết hợp các Segment lại
export const generateProceduralLevel = (difficulty: number): { regex: string, correct: string[], wrong: string[] } => {
    
    const segments: GeneratedPattern[] = [];
    
    // Số lượng phân đoạn dựa trên độ khó
    // Diff 1: 1 segment (\d{3})
    // Diff 5: 2 segments + separator ([A-Z]{3}-\d{2})
    // Diff 8: 3 segments ...
    const numSegments = difficulty <= 2 ? 1 : difficulty <= 6 ? 2 : 3;
    const separators = ["-", "_", ".", " ", ":", ""];
    const separator = difficulty > 2 ? pick(separators) : "";

    for (let i = 0; i < numSegments; i++) {
        segments.push(createSegment(difficulty));
    }

    // Xây dựng Regex chuỗi và Hàm sinh dữ liệu tổng
    const fullRegex = segments.map(s => s.regex).join(separator === "." ? "\\." : separator);
    
    // Hàm sinh chuỗi đúng tổng thể
    const generateTotalMatch = () => {
        return segments.map(s => s.generateMatch()).join(separator);
    };

    // Hàm sinh chuỗi sai tổng thể
    const generateTotalWrong = () => {
        // Chọn ngẫu nhiên 1 segment để làm sai, các segment khác giữ đúng
        // Điều này tạo ra các bẫy "gần đúng" rất khó chịu
        const badSegmentIndex = Math.floor(Math.random() * numSegments);
        return segments.map((s, idx) => {
            return idx === badSegmentIndex ? s.generateWrong() : s.generateMatch();
        }).join(separator);
    };

    // Sinh dữ liệu Candidates
    const correctCount = rnd(3, 5); // 3 đến 5 đáp án đúng
    const wrongCount = rnd(5, 8);   // 5 đến 8 đáp án sai

    const correct = Array.from({ length: correctCount }, generateTotalMatch);
    // Lọc trùng lặp cho wrong candidates
    const wrong = Array.from({ length: wrongCount }, generateTotalWrong);

    // Thêm case đặc biệt cho độ khó cao: Alternation (Hoặc cái này hoặc cái kia)
    // Vd: cat|dog
    if (difficulty > 3 && Math.random() < 0.3) {
        // Ghi đè logic nếu rơi vào trường hợp đặc biệt này
        const word1 = createSegment(1);
        const word2 = createSegment(1);
        // Đảm bảo regex khác nhau
        if (word1.regex !== word2.regex) {
            return {
                regex: `(${word1.regex}|${word2.regex})`,
                correct: [word1.generateMatch(), word2.generateMatch(), word1.generateMatch(), word2.generateMatch()],
                wrong: [word1.generateWrong(), word2.generateWrong(), word1.generateWrong() + word2.generateMatch()]
            };
        }
    }

    return {
        regex: fullRegex,
        correct,
        wrong
    };
};