import {
  AstigmatismTest,
  ColorVisionTest,
  ContrastSensitivity,
  TumblingETest,
  VisualAcuity,
} from "../models/EyeTest.js";
const BASE_URL = "http://localhost:6005";

const getQuestionForSize = (step) => {
  const letters = ["E", "F", "P", "T", "O", "Z", "L"];
  const size = 8 - step;
  return {
    letter: letters[size - 1],
    size,
    options: shuffleOptions([letters[size - 1], "A", "B", "C"]),
  };
};

function shuffleOptions(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function interpretResults(leftScore, rightScore, logs) {
  const interpretation = {
    leftEye: {},
    rightEye: {},
    overall: {},
  };

  // Left eye interpretation
  interpretation.leftEye = {
    score: leftScore,
    status: leftScore >= 0.7 ? "Normal vision" : "Possible impairment",
    note:
      leftScore === 0.7
        ? "Excellent visual acuity"
        : "Mild reduction in acuity",
  };

  // Right eye interpretation
  interpretation.rightEye = {
    score: rightScore,
    status: rightScore >= 0.7 ? "Normal vision" : "Possible impairment",
    note: "Minor difficulty with smallest letters",
  };

  // Overall assessment
  interpretation.overall = {
    conclusion: "Both eyes show normal visual acuity",
    recommendation:
      rightScore === leftScore
        ? "No significant difference between eyes"
        : "Consider follow-up for right eye",
  };

  return interpretation;
}

export const startTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    // Check if existing test exists
    let test = await VisualAcuity.findOne({ userId });

    if (!test) {
      // Create new test if doesn't exist
      test = await VisualAcuity.create({
        userId,
        activeEye,
        currentStep: 1,
      });
    } else {
      // Update existing test with new active eye
      test.activeEye = activeEye;
      test.currentStep = 1;
      await test.save();
    }

    return res
      .status(201)
      .json({ success: true, message: "Test started", data: test });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await VisualAcuity.findOne({ userId }).sort({ createdAt: -1 });

    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    const activeEyeData = test[`${test.activeEye}EyeAcuity`];

    if (activeEyeData.finished) {
      return res.status(200).json({
        success: true,
        finished: true,
        message: `${test.activeEye} eye test completed`,
      });
    }

    const step = test.currentStep;
    const question = getQuestionForSize(step);

    return res.status(200).json({
      success: true,
      finished: false,
      currentStep: step,
      question,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedOption, correct, size } = req.body;

    const test = await VisualAcuity.findOne({ userId });
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    let activeEyeKey = `${test.activeEye}EyeAcuity`;
    let eyeData = test[activeEyeKey];

    // Update logs
    test.logs.push({
      step: test.currentStep,
      size,
      selectedOption,
      correct,
      eye: test.activeEye,
    });

    if (correct) {
      if (test.currentStep < 7) {
        test.currentStep++;
      } else {
        // Reached hardest level with correct answer
        eyeData.finished = true;
        eyeData.value = (8 - size) * 0.1;
        eyeData.smallestStepCounter = size; // Store the smallest size achieved
      }
    } else {
      if (test.currentStep > 1) {
        test.currentStep--;
        eyeData.directionChangeCounter++;
      } else {
        // Reached easiest level with incorrect answer
        eyeData.finished = true;
        eyeData.value = (8 - size) * 0.1;
      }
    }

    // Additional completion conditions
    if (eyeData.directionChangeCounter >= 3) {
      eyeData.finished = true;
      eyeData.value = (8 - size) * 0.1;
    }

    // Mark finished if we've seen this size multiple times
    const sameSizeAttempts = test.logs.filter(
      (log) => log.eye === test.activeEye && log.size === size
    ).length;

    if (sameSizeAttempts >= 2) {
      eyeData.finished = true;
      eyeData.value = (8 - size) * 0.1;
    }

    await test.save();
    return res.status(200).json({
      success: true,
      message: "Answer recorded",
      data: test,
      eyeFinished: eyeData.finished,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await VisualAcuity.findOne({ userId });

    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    const left = test.leftEyeAcuity;
    const right = test.rightEyeAcuity;

    // Check if both eyes are tested
    if (!left.finished || !right.finished) {
      return res.status(200).json({
        success: true,
        completed: false,
        message: "Both eye tests not completed yet",
        progress: {
          leftDone: left.finished,
          rightDone: right.finished,
        },
      });
    }

    return res.status(200).json({
      success: true,
      completed: true,
      message: "Test results ready",
      result: {
        leftEye: left.value,
        rightEye: right.value,
        interpretation: interpretResults(left.value, right.value),
        logs: test.logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const COLOR_PALETTE = [
  { color: "#FF0000", name: "Red" },
  { color: "#00FF00", name: "Green" },
  { color: "#0000FF", name: "Blue" },
  { color: "#FFFF00", name: "Yellow" },
  { color: "#FF00FF", name: "Magenta" },
  { color: "#00FFFF", name: "Cyan" },
  { color: "#FFA500", name: "Orange" },
  { color: "#800080", name: "Purple" },
  { color: "#FFC0CB", name: "Pink" },
];

const OPACITY_LEVELS = [1, 0.8, 0.6, 0.4, 0.2];

const getContrastDiscriminationQuestion = (step) => {
  const baseColor =
    COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  const differentColor = COLOR_PALETTE.filter(
    (c) => c.color !== baseColor.color
  )[Math.floor(Math.random() * (COLOR_PALETTE.length - 1))];

  // Define grid size based on step
  const gridSize = step + 1; // Step 1 => 2x2, Step 2 => 3x3, ..., Step 7 => 8x8
  const totalItems = gridSize * gridSize;

  // Create all same colors, place 1 different
  const colors = Array(totalItems).fill(baseColor.color);
  const differentIndex = Math.floor(Math.random() * totalItems);
  colors[differentIndex] = differentColor.color;

  return {
    colors,
    differentIndex,
    differentColor: differentColor.color,
    opacityLevel: OPACITY_LEVELS[Math.min(step - 1, OPACITY_LEVELS.length - 1)],
    step,
    gridSize,
  };
};

function interpretContrastDiscrimination(leftScore, rightScore) {
  return {
    leftEye: {
      score: leftScore,
      status: leftScore >= 60 ? "Normal" : "Impaired",
      note:
        leftScore >= 80
          ? "Excellent"
          : leftScore >= 60
          ? "Moderate"
          : "Significant impairment",
    },
    rightEye: {
      score: rightScore,
      status: rightScore >= 60 ? "Normal" : "Impaired",
      note:
        rightScore >= 80
          ? "Excellent"
          : rightScore >= 60
          ? "Moderate"
          : "Significant impairment",
    },
    comparison: {
      conclusion:
        leftScore === rightScore
          ? "Equal discrimination"
          : "Difference between eyes",
      recommendation: "Consult specialist if scores below 60%",
    },
  };
}

export const startContrastTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    let test = await ContrastSensitivity.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!test) {
      test = await ContrastSensitivity.create({
        userId,
        activeEye,
        currentStep: 1,
      });
    } else {
      test.activeEye = activeEye;
      test.currentStep = 1;
      await test.save();
    }

    return res.status(201).json({
      success: true,
      message: "Color discrimination test started",
      data: test,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleContrastQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ContrastSensitivity.findOne({ userId });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const activeEyeData = test[`${test.activeEye}EyeResult`];

    if (activeEyeData.finished) {
      return res.status(200).json({
        success: true,
        finished: true,
        message: `${test.activeEye} eye test completed`,
      });
    }

    const question = getContrastDiscriminationQuestion(test.currentStep);

    return res.status(200).json({
      success: true,
      finished: false,
      currentStep: test.currentStep,
      question: {
        colors: question.colors,
        opacityLevel: question.opacityLevel,
        step: question.step,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitContrastAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedIndex, correct, colors, differentColor, opacityLevel } =
      req.body;

    const test = await ContrastSensitivity.findOne({ userId });
    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    let activeEyeKey = `${test.activeEye}EyeResult`;
    let eyeData = test[activeEyeKey];

    test.logs.push({
      step: test.currentStep,
      colors,
      differentColor,
      opacityLevel,
      selectedIndex,
      correct,
      eye: test.activeEye,
    });

    if (correct) {
      eyeData.correctCounter++;
      eyeData.discriminationScore = Math.max(
        eyeData.discriminationScore,
        100 - test.currentStep * 20
      );
    } else {
      eyeData.incorrectCounter++;
    }

    if (correct) {
      if (test.currentStep < 5) {
        test.currentStep++;
      } else {
        eyeData.finished = true;
      }
    } else {
      if (test.currentStep > 1) {
        test.currentStep--;
      } else {
        eyeData.finished = true;
      }
    }

    const incorrectAtLevel = test.logs.filter(
      (log) =>
        log.eye === test.activeEye &&
        log.opacityLevel === opacityLevel &&
        !log.correct
    ).length;

    if (incorrectAtLevel >= 3) {
      eyeData.finished = true;
    }

    await test.save();
    return res.status(200).json({
      success: true,
      message: "Answer recorded",
      data: test,
      eyeFinished: eyeData.finished,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getContrastResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ContrastSensitivity.findOne({ userId });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    const left = test.leftEyeResult;
    const right = test.rightEyeResult;

    if (!left.finished || !right.finished) {
      return res.status(200).json({
        success: true,
        completed: false,
        message: "Both eye tests not completed",
        progress: {
          leftDone: left.finished,
          rightDone: right.finished,
        },
      });
    }

    return res.status(200).json({
      success: true,
      completed: true,
      message: "Color discrimination test results ready",
      result: {
        leftEye: {
          discriminationScore: left.discriminationScore,
        },
        rightEye: {
          discriminationScore: right.discriminationScore,
        },
        interpretation: interpretContrastDiscrimination(
          left.discriminationScore,
          right.discriminationScore
        ),
        logs: test.logs,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const colorTestQuestions = [
  {
    imageName: "ishihara_1",
    imageUrl: `/ColorTestImages/ishihara_1.svg`,
    options: ["12", "46", "48", "42", "Nothing"],
    correctOption: "12",
  },
  {
    imageName: "ishihara_2",
    imageUrl: `/ColorTestImages/ishihara_2.svg`,
    options: ["29", "89", "28", "21", "Nothing"],
    correctOption: "29",
  },
  {
    imageName: "ishihara_3",
    imageUrl: `/ColorTestImages/ishihara_3.svg`,
    options: ["74", "14", "71", "76", "Nothing"],
    correctOption: "74",
  },
  {
    imageName: "ishihara_4",
    imageUrl: `/ColorTestImages/ishihara_4.svg`,
    options: ["45", "15", "46", "48", "Nothing"],
    correctOption: "45",
  },
  {
    imageName: "ishihara_5",
    imageUrl: `/ColorTestImages/ishihara_5.svg`,
    options: ["5", "6", "8", "9", "Nothing"],
    correctOption: "5",
  },
  {
    imageName: "ishihara_6",
    imageUrl: `/ColorTestImages/ishihara_6.svg`,
    options: ["14", "36", "47", "32", "Nothing"],
    correctOption: "Nothing",
  },
  {
    imageName: "ishihara_7",
    imageUrl: `/ColorTestImages/ishihara_7.svg`,
    options: ["8", "9", "6", "2", "Nothing"],
    correctOption: "8",
  },
];

export const startColorTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    let test = await ColorVisionTest.findOne({ userId });

    if (!test) {
      test = await ColorVisionTest.create({
        userId,
        activeEye,
        currentStep: 1,
      });
    } else {
      test.activeEye = activeEye;
      test.currentStep = 1;
      await test.save();
    }

    res
      .status(201)
      .json({ success: true, message: "Color test started", data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getColorQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ColorVisionTest.findOne({ userId });

    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const activeEyeData = test[`${test.activeEye}EyeResult`];
    if (activeEyeData.finished)
      return res.status(200).json({
        success: true,
        finished: true,
        message: "Test already completed for this eye",
      });

    const step = test.currentStep - 1;
    if (step >= colorTestQuestions.length)
      return res
        .status(200)
        .json({ success: true, finished: true, message: "No more questions" });

    const question = colorTestQuestions[step];
    res.status(200).json({
      success: true,
      finished: false,
      currentStep: test.currentStep,
      question,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitColorAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedOption } = req.body;

    const test = await ColorVisionTest.findOne({ userId });
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const stepIndex = test.currentStep - 1;
    const question = colorTestQuestions[stepIndex];
    const isCorrect = selectedOption === question.correctOption;

    const eyeKey = `${test.activeEye}EyeResult`;
    const eyeResult = test[eyeKey];

    // Update log
    test.logs.push({
      step: test.currentStep,
      imageName: question.imageName,
      options: question.options,
      correctOption: question.correctOption,
      selectedOption,
      correct: isCorrect,
      eye: test.activeEye,
    });

    // Update score
    if (isCorrect) {
      eyeResult.correctCounter += 1;
    } else {
      eyeResult.incorrectCounter += 1;
    }

    // Check completion
    if (test.currentStep >= colorTestQuestions.length) {
      eyeResult.finished = true;
    } else {
      test.currentStep += 1;
    }

    await test.save();
    res.status(200).json({
      success: true,
      message: "Answer recorded",
      correct: isCorrect,
      finished: eyeResult.finished,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getColorTestResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ColorVisionTest.findOne({ userId });

    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const left = test.leftEyeResult;
    const right = test.rightEyeResult;

    if (!left.finished || !right.finished) {
      return res.status(200).json({
        success: true,
        completed: false,
        message: "Both eyes not completed yet",
        progress: {
          leftDone: left.finished,
          rightDone: right.finished,
        },
      });
    }

    const total = colorTestQuestions.length;
    const interpret = (correct) =>
      correct >= 6
        ? "Normal Color Vision"
        : correct >= 4
        ? "Mild Deficiency"
        : "Color Vision Deficiency";

    return res.status(200).json({
      success: true,
      completed: true,
      result: {
        leftEye: {
          score: left.correctCounter,
          status: interpret(left.correctCounter),
        },
        rightEye: {
          score: right.correctCounter,
          status: interpret(right.correctCounter),
        },
        logs: test.logs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startAstigmatismTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    let test = await AstigmatismTest.findOne({ userId });
    if (!test) {
      test = await AstigmatismTest.create({
        userId,
        activeEye,
        currentStep: 1,
      });
    } else {
      test.activeEye = activeEye;
      test.currentStep = 1;
      await test.save();
    }

    res.status(201).json({
      success: true,
      message: "Astigmatism test started",
      data: test,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAstigmatismQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await AstigmatismTest.findOne({ userId });
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const eyeData = test[`${test.activeEye}EyeResult`];
    if (eyeData.finished) {
      return res.status(200).json({
        success: true,
        finished: true,
        message: "Test already completed for this eye",
      });
    }

    const question = {
      instruction:
        "Cover your left eye. Keep your device at arm's length. Focus on the center of the semicircle. Do all the lines look like they are in the same shade of black?",
      options: ["Yes", "No"],
    };

    res.status(200).json({
      success: true,
      finished: false,
      currentStep: test.currentStep,
      question,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAstigmatismAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedOption } = req.body; // "Yes" or "No"

    const test = await AstigmatismTest.findOne({ userId });
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const isSameShade = selectedOption === "Yes";
    const eyeKey = `${test.activeEye}EyeResult`;

    // Log the response
    test.logs.push({
      step: test.currentStep,
      eye: test.activeEye,
      userResponse: isSameShade,
      imageShown: "radial-lines.svg",
    });

    test[eyeKey].seesAllLinesEqually = isSameShade;
    test[eyeKey].finished = true;
    test.currentStep += 1;

    await test.save();
    res.status(200).json({
      success: true,
      message: "Answer recorded",
      correct: isSameShade,
      finished: true,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAstigmatismResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await AstigmatismTest.findOne({ userId });

    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const { leftEyeResult, rightEyeResult } = test;

    if (!leftEyeResult.finished || !rightEyeResult.finished) {
      return res.status(200).json({
        success: true,
        completed: false,
        message: "Both eyes not completed yet",
        progress: {
          leftDone: leftEyeResult.finished,
          rightDone: rightEyeResult.finished,
        },
      });
    }

    const interpret = (value) =>
      value ? "No Astigmatism Detected" : "Possible Astigmatism";

    res.status(200).json({
      success: true,
      completed: true,
      result: {
        leftEye: {
          response: leftEyeResult.seesAllLinesEqually,
          status: interpret(leftEyeResult.seesAllLinesEqually),
        },
        rightEye: {
          response: rightEyeResult.seesAllLinesEqually,
          status: interpret(rightEyeResult.seesAllLinesEqually),
        },
        logs: test.logs,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startTumblingETest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    let test = await TumblingETest.findOne({ userId });
    if (!test) {
      test = await TumblingETest.create({ userId, activeEye });
    } else {
      test.activeEye = activeEye;
      test.currentStep = 1;
      await test.save();
    }

    res.status(201).json({
      success: true,
      message: "Tumbling E Test started",
      data: test,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTumblingEQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await TumblingETest.findOne({ userId });

    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    const eyeData = test[`${test.activeEye}EyeResult`];
    if (eyeData.finished) {
      return res.status(200).json({
        success: true,
        finished: true,
        message: "Test already completed for this eye",
      });
    }

    // Define direction and image options
    const directions = ["up", "down", "left", "right"];
    const randomDirection =
      directions[Math.floor(Math.random() * directions.length)];

    // Define size based on current step
    const stepToSizeMap = {
      1: "100px",
      2: "75px",
      3: "50px",
      4: "40px",
      5: "30px",
      6: "20px",
      7: "15px",
    };

    const imageSize = stepToSizeMap[test.currentStep] || "15px";
    const question = {
      instruction: `Look at the letter E and tell in which direction it is pointing.`,
      direction: randomDirection, // backend uses this for logging and validation
      size: imageSize,
      options: directions,
    };

    // Optionally: Store shown question in logs (if not logging in submit)
    res.status(200).json({
      success: true,
      finished: false,
      currentStep: test.currentStep,
      question,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitTumblingEAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shownDirection, selectedDirection } = req.body;

    const test = await TumblingETest.findOne({ userId });
    if (!test)
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });

    const isCorrect = shownDirection === selectedDirection;
    const eyeKey = `${test.activeEye}EyeResult`;

    if (isCorrect) {
      test[eyeKey].correctCounter += 1;
    } else {
      test[eyeKey].incorrectCounter += 1;
    }

    test.logs.push({
      step: test.currentStep,
      eye: test.activeEye,
      shownDirection,
      selectedDirection,
      correct: isCorrect,
      imageShown: `e_${shownDirection}.svg`,
    });

    test.currentStep += 1;

    if (test[eyeKey].correctCounter + test[eyeKey].incorrectCounter >= 7) {
      test[eyeKey].finished = true;
    }

    await test.save();

    res.status(200).json({
      success: true,
      correct: isCorrect,
      finished: test[eyeKey].finished,
      nextStep: test.currentStep,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTumblingEResult = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await TumblingETest.findOne({ userId });

    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    const { leftEyeResult, rightEyeResult } = test;

    const evaluateEye = (eyeResult) => {
      const total = eyeResult.correctCounter + eyeResult.incorrectCounter;
      const accuracy = total > 0 ? (eyeResult.correctCounter / total) * 100 : 0;
      const status = accuracy >= 70 ? "Good" : "Needs Attention";

      return {
        correct: eyeResult.correctCounter,
        incorrect: eyeResult.incorrectCounter,
        accuracy: `${accuracy.toFixed(1)}%`,
        status,
        finished: eyeResult.finished,
      };
    };

    const leftEyeEvaluation = evaluateEye(leftEyeResult);
    const rightEyeEvaluation = evaluateEye(rightEyeResult);

    let eyeConcern = [];
    if (leftEyeEvaluation.status === "Needs Attention")
      eyeConcern.push("Left Eye");
    if (rightEyeEvaluation.status === "Needs Attention")
      eyeConcern.push("Right Eye");

    res.status(200).json({
      success: true,
      completed: leftEyeResult.finished && rightEyeResult.finished,
      result: {
        leftEye: leftEyeEvaluation,
        rightEye: rightEyeEvaluation,
      },
      logs: test.logs,
      interpretation:
        eyeConcern.length === 0
          ? "Both eyes performed well."
          : `${eyeConcern.join(" and ")} may need attention.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTestResult = async (req, res) => {
  try {
    const userId = req.user.id;

    const tumblingETestResult = await TumblingETest.findOne({ userId }).sort({ createdAt: -1 });
    const visualAcuityResult = await VisualAcuity.findOne({ userId }).sort({ createdAt: -1 });
    const contrastSensitivityResult = await ContrastSensitivity.findOne({ userId }).sort({ createdAt: -1 });
    const colorVisionResult = await ColorVisionTest.findOne({ userId }).sort({ createdAt: -1 });
    const astigmatismResult = await AstigmatismTest.findOne({ userId }).sort({ createdAt: -1 });

    const result = {
      tumblingETestResult,
      visualAcuityResult,
      contrastSensitivityResult,
      colorVisionResult,
      astigmatismResult
    };

    res.status(200).json({
      success: true,
      message: "Test result fetched successfully",
      result
    });

  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


