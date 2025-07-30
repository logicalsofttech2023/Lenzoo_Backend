import { ContrastSensitivity, VisualAcuity } from "../models/EyeTest.js";

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

const getColorDiscriminationQuestion = (step) => {
  const baseColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  const differentColor = COLOR_PALETTE.filter(c => c.color !== baseColor.color)[
    Math.floor(Math.random() * (COLOR_PALETTE.length - 1))
  ];

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
    gridSize
  };
};

function interpretColorDiscrimination(leftScore, rightScore) {
  return {
    leftEye: {
      score: leftScore,
      status: leftScore >= 60 ? 'Normal' : 'Impaired',
      note: leftScore >= 80 ? 'Excellent' : 
            leftScore >= 60 ? 'Moderate' : 'Significant impairment'
    },
    rightEye: {
      score: rightScore,
      status: rightScore >= 60 ? 'Normal' : 'Impaired',
      note: rightScore >= 80 ? 'Excellent' : 
            rightScore >= 60 ? 'Moderate' : 'Significant impairment'
    },
    comparison: {
      conclusion: leftScore === rightScore ? 
        'Equal discrimination' : 'Difference between eyes',
      recommendation: 'Consult specialist if scores below 60%'
    }
  };
}

export const startColorTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activeEye } = req.body;

    let test = await ContrastSensitivity.findOne({ userId }).sort({ createdAt: -1 });

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
      data: test 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleColorQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ContrastSensitivity.findOne({ userId });

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
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

    const question = getColorDiscriminationQuestion(test.currentStep);

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

export const submitColorAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selectedIndex, correct, colors, differentColor, opacityLevel } = req.body;

    const test = await ContrastSensitivity.findOne({ userId });
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
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
        100 - (test.currentStep * 20)
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
      log => log.eye === test.activeEye && 
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

export const getColorResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const test = await ContrastSensitivity.findOne({ userId });

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: "Test not found" 
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
        interpretation: interpretColorDiscrimination(
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