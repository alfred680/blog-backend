const Message = require("../model/chatboxmodel");
const Blogs = require("../model/blogmodel");
const User = require("../model/usermodel");
const Conversation = require("../model/conversationmodel");

// Helper - find conversation between two users
async function findConversationBetween(userA, userB) {
  return await Conversation.findOne({ participants: { $all: [userA, userB] } });
}

// Create a conversation using a blogId (initial step required by spec)
exports.createConversation = async (req, res) => {
  try {
    const { blogId } = req.body;
    const userId = req.payload.userId;

    if (!blogId) return res.status(400).json({ error: "blogId is required to create a conversation" });

    const blog = await Blogs.findById(blogId).populate("author", "username email profile");
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const receiverId = blog.author._id;
    if (receiverId.toString() === userId.toString()) {
      return res.status(400).json({ error: "You cannot start a conversation with yourself" });
    }

    // check if conversation already exists (between the two users)
    let conversation = await findConversationBetween(userId, receiverId);
    if (conversation) {
      // if there is no blogId on the existing conversation, attach it now
      if (!conversation.blogId) {
        conversation.blogId = blogId;
        await conversation.save();
      }
      return res.status(200).json(conversation);
    }

    conversation = new Conversation({
      blogId,
      participants: [userId, receiverId],
      createdBy: userId,
    });

    await conversation.save();

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// List conversations for the current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.payload.userId;
    const convs = await Conversation.find({ participants: userId })
      .populate('participants', 'username email profile')
      .sort({ updatedAt: -1 });
    res.status(200).json(convs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message. Rules:
// - If conversationId is provided, use it (must be participant)
// - Else if blogId provided, find blog author and create or reuse conversation
// - Else if receiverId provided, require that a conversation between them already exists (can't start a fresh chat without blogId)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, blogId, receiverId, message } = req.body;
    const senderId = req.payload.userId;
    const senderMail = req.payload.userMail;

    if (!message) return res.status(400).json({ error: "message is required" });

    let conversation = null;
    let receiver = null;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      // verify participant
      if (!conversation.participants.map(String).includes(String(senderId))) {
        return res.status(403).json({ error: "You are not a participant in this conversation" });
      }
      receiver = await User.findOne({ _id: { $in: conversation.participants.filter(p => p.toString() !== senderId.toString()) } }).select('username email profile');
    } else if (blogId) {
      const blog = await Blogs.findById(blogId).populate('author', 'username email profile');
      if (!blog) return res.status(404).json({ error: 'Blog not found' });
      const receiverIdFromBlog = blog.author._id;
      if (receiverIdFromBlog.toString() === senderId.toString()) return res.status(400).json({ error: "You cannot message yourself" });
      receiver = blog.author;
      conversation = await findConversationBetween(senderId, receiverIdFromBlog);
      if (!conversation) {
        conversation = new Conversation({ blogId, participants: [senderId, receiverIdFromBlog], createdBy: senderId });
        await conversation.save();
      }
    } else if (receiverId) {
      // allow creating a conversation when receiverId is provided
      if (receiverId.toString() === senderId.toString()) return res.status(400).json({ error: "You cannot message yourself" });
      receiver = await User.findById(receiverId).select('username email profile');
      if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
      conversation = await findConversationBetween(senderId, receiverId);
      if (!conversation) {
        conversation = new Conversation({ participants: [senderId, receiverId], createdBy: senderId });
        await conversation.save();
      }
    } else {
      return res.status(400).json({ error: "conversationId, blogId, or receiverId must be provided" });
    }

    const newMessage = new Message({
      conversation: conversation ? conversation._id : null,
      blogId: blogId || (conversation && conversation.blogId) || null,
      sender: senderId,
      senderMail,
      receiver: receiver._id,
      receiverMail: receiver.email,
      message,
    });

    await newMessage.save();

    // update conversation lastMessage and touch updatedAt
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = Date.now();
      await conversation.save();
    }

    res.status(200).json({
      message: newMessage,
      conversationId: conversation ? conversation._id : null,
      receiver: {
        id: receiver._id,
        name: receiver.username,
        email: receiver.email,
        avatar: receiver.profile || "default-avatar.png",
      },
    });

  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Get all messages between two users (legacy)
exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const userId = req.payload.userId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);

  } catch (err) {
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

// Get messages for a conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.payload.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!conversation.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Not a participant in this conversation' });

    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a conversation and its messages (participants only)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.payload.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (!conversation.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'Not a participant in this conversation' });

    // Remove all messages associated with the conversation
    await Message.deleteMany({ conversation: conversationId });
    await conversation.deleteOne();

    res.status(200).json({ message: 'Conversation and messages deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a single message (sender or conversation participant)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.payload.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Allow if sender
    if (message.sender.toString() === userId.toString()) {
      await message.deleteOne();
    } else if (message.conversation) {
      // Or allow if user is a participant of the conversation
      const conversation = await Conversation.findById(message.conversation);
      if (!conversation) return res.status(403).json({ error: 'You are not allowed to delete this message' });
      if (!conversation.participants.map(String).includes(String(userId))) return res.status(403).json({ error: 'You are not allowed to delete this message' });
      await message.deleteOne();
    } else {
      return res.status(403).json({ error: 'You are not allowed to delete this message' });
    }

    // If the message belonged to a conversation, update lastMessage
    if (message.conversation) {
      const last = await Message.findOne({ conversation: message.conversation }).sort({ createdAt: -1 });
      if (last) {
        await Conversation.findByIdAndUpdate(message.conversation, { lastMessage: last.message, updatedAt: Date.now() });
      } else {
        await Conversation.findByIdAndUpdate(message.conversation, { lastMessage: null, updatedAt: Date.now() });
      }
    }

    res.status(200).json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getChatReceiver = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blogs.findById(blogId).populate(
      "author",
      "username email profile"
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({
      id: blog.author._id,
      name: blog.author.username,
      email: blog.author.email,
      avatar: blog.author.profile || "default-avatar.png",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
