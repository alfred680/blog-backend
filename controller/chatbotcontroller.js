const Chat = require("../model/chatbotmodel");


const predefinedQuestions = [
  
  "How Can I Help You",
  "You Issue Is Reported And Your issue Resove In 48 Hours",
  
];

// chatbot 
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.payload.userId;
    const userMail = req.payload.userMail;
    const { questionIndex, answer } = req.body;

    if (questionIndex === undefined || !answer)
      return res.status(400).json({ message: "Question index and answer required" });

    const question = predefinedQuestions[questionIndex];
    if (!question) return res.status(400).json({ message: "Invalid question index" });

    // Find or create chat document
    let chat = await Chat.findOne({ userId });
    if (!chat) chat = new Chat({ userId, userMail, qa: [] });

    // Save the question and user's answer
    chat.qa.push({ question, answer });

    await chat.save();

    // Determine next question
    const nextQuestion = predefinedQuestions[questionIndex + 1] || null;

    res.status(200).json({ nextQuestion, qa: chat.qa });

  } catch (err) {
    console.error("Error saving chat answer:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getAllChats = async (req, res) => {
  try {
    const allChats = await Chat.find().populate("userId", "username email");
    res.status(200).json(allChats);
  } catch (err) {
    console.error("Error fetching all chats:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
