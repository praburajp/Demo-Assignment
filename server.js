const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const files = ["A.txt", "B.txt", "C.txt", "D.txt"];
const dataDir = path.join(__dirname, "");

app.use(express.json());

const getFilePath = (num) => {
  if (num > 140) return "A.txt";
  else if (num <= 140 && num > 100) return "B.txt";
  else if (num <= 100 && num > 60) return "C.txt";
  else return "D.txt";
};

const checkContentExists = async (filePath) => {
  const content = await fs.promises
    .readFile(path.join(dataDir, filePath), "utf-8")
    .catch(() => "");
  if (content) {
    return true;
  } else {
    return false;
  }
};

const saveNumber = async (num) => {
  const multipliedNum = num * 7;
  const filePath = getFilePath(multipliedNum);
  const numberExists = await checkContentExists(filePath);
  if (numberExists) {
    return { success: false, message: "Number already exists. Cannot append." };
  }

  await fs.promises
    .appendFile(path.join(dataDir, filePath), `${num}\n`)
    .catch(() => {
      return { success: false, message: "Unable to append." };
    });

  const allFilesFull = await Promise.all(
    files.map(async (file) => {
      const content = await fs.promises
        .readFile(path.join(dataDir, file), "utf-8")
        .catch(() => "");
      return content.split("\n").filter(Boolean).length > 0;
    })
  );

  if (allFilesFull.every((full) => full)) {
    return {
      success: true,
      message: "All files have numbers. Process complete.",
    };
  } else {
    return {
      success: true,
      message: `Number ${num} appended successfully on file ${filePath}`,
    };
  }
};

app.post("/input", async (req, res) => {
  const num = req.body.number;
  if (num >= 1 && num <= 25) {
    const result = await saveNumber(num);
    res.json(result);
  } else {
    res.json({
      success: false,
      message: "Invalid input. Please enter a number between 1 and 25.",
    });
  }
});

app.get("/list-numbers", async (req, res) => {
  const numbers = {};

  for (const file of files) {
    const content = await fs.promises
      .readFile(path.join(dataDir, file), "utf-8")
      .catch(() => "");
    numbers[file] = content.split("\n").filter(Boolean);
  }

  res.json(numbers);
});

app.get("/", async (req, res) => {
  res.send("Demo-Assignment");
});
app.listen(PORT, async () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, '', 'utf-8');
    }
  }

  console.log(`Server running on http://localhost:${PORT}`);
});