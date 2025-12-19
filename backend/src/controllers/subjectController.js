const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const UserProgress = require('../models/UserProgress');

// Get all subjects
const getSubjects = async (req, res) => {
  try {
    const { level, includeProgress = false } = req.query;
    const userId = req.user?.id;

    let subjects;
    if (level) {
      subjects = await Subject.findActive(level);
    } else {
      subjects = await Subject.findActive();
    }

    // Add user progress if requested and user is authenticated
    if (includeProgress && userId) {
      for (const subject of subjects) {
        const progress = await UserProgress.getSubjectCompletionStats(userId);
        const subjectProgress = progress.find(p => p.subjectId === subject.id);

        subject.dataValues.userProgress = subjectProgress || {
          completed: 0,
          total: 0,
          completionRate: 0
        };

        // Add topics count
        subject.dataValues.topicsCount = await subject.getTopicsCount();
      }
    }

    res.status(200).json({
      success: true,
      data: subjects,
      message: `${subjects.length} subjects found`
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

// Get single subject with topics
const getSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user?.id;

    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get published topics for this subject
    const topics = await subject.getActiveTopics();

    // Add user progress for each topic if authenticated
    if (userId) {
      for (const topic of topics) {
        const progress = await topic.getUserProgress(userId);
        topic.dataValues.userProgress = progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestQuizScore: progress.bestQuizScore,
          timeSpentSeconds: progress.timeSpentSeconds
        } : null;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        subject,
        topics,
        topicsCount: topics.length
      }
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error.message
    });
  }
};

// Get topics for a subject
const getSubjectTopics = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { class: classLevel, term, includeProgress = false } = req.query;
    const userId = req.user?.id;

    // Verify subject exists
    const subject = await Subject.findByPk(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Build query conditions
    const whereClause = { subjectId, isPublished: true };
    if (classLevel) whereClause.classLevel = classLevel;
    if (term) whereClause.term = term;

    const topics = await Topic.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC']]
    });

    // Add progress and subtopics count if requested
    if (includeProgress && userId) {
      for (const topic of topics) {
        // Get user progress for this topic
        const progress = await topic.getUserProgress(userId);
        topic.dataValues.userProgress = progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          bestQuizScore: progress.bestQuizScore
        } : null;

        // Get subtopics count
        topic.dataValues.subtopicsCount = await topic.getSubtopicsCount();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        subject: {
          id: subject.id,
          name: subject.name,
          code: subject.code
        },
        topics,
        totalCount: topics.length
      }
    });
  } catch (error) {
    console.error('Get subject topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topics',
      error: error.message
    });
  }
};

// Get single topic with subtopics
const getTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user?.id;

    const topic = await Topic.findByPk(topicId, {
      include: [{
        model: Subject,
        as: 'subject'
      }]
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }

    // Get published subtopics
    const subtopics = await topic.getPublishedSubtopics();

    // Add user progress for each subtopic
    if (userId) {
      for (const subtopic of subtopics) {
        const progress = await subtopic.getUserProgress(userId);
        subtopic.dataValues.userProgress = progress ? {
          status: progress.status,
          completionPercentage: progress.completionPercentage,
          quizAttempts: progress.quizAttempts,
          bestQuizScore: progress.bestQuizScore,
          timeSpentSeconds: progress.timeSpentSeconds
        } : null;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        topic,
        subtopics,
        subtopicsCount: subtopics.length
      }
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch topic',
      error: error.message
    });
  }
};

// Get single subtopic
const getSubtopic = async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const userId = req.user?.id;

    const subtopic = await Subtopic.findByPk(subtopicId, {
      include: [{
        model: Topic,
        as: 'topic',
        include: [{
          model: Subject,
          as: 'subject'
        }]
      }]
    });

    if (!subtopic) {
      return res.status(404).json({
        success: false,
        message: 'Subtopic not found'
      });
    }

    // Get user progress
    let userProgress = null;
    if (userId) {
      userProgress = await subtopic.getUserProgress(userId);
      if (userProgress) {
        // Mark as accessed
        userProgress.addTimeSpent(0); // Just update last accessed
        await userProgress.save();
      }
    }

    // Get next/previous subtopics
    const nextSubtopic = await subtopic.getNextSubtopic();
    const prevSubtopic = await subtopic.getPreviousSubtopic();

    res.status(200).json({
      success: true,
      data: {
        subtopic,
        userProgress,
        navigation: {
          next: nextSubtopic ? {
            id: nextSubtopic.id,
            title: nextSubtopic.title,
            slug: nextSubtopic.slug
          } : null,
          previous: prevSubtopic ? {
            id: prevSubtopic.id,
            title: prevSubtopic.title,
            slug: prevSubtopic.slug
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Get subtopic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subtopic',
      error: error.message
    });
  }
};

// Search content
const searchContent = async (req, res) => {
  try {
    const { q: query, type, subjectId, limit = 20 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    let results = [];

    if (type === 'subtopics' || !type) {
      const subtopics = await Subtopic.search(query, limit);
      results = results.concat(subtopics.map(item => ({
        id: item.id,
        title: item.title,
        content: item.summary || item.content.substring(0, 200) + '...',
        type: 'subtopic',
        subject: item.topic.subject.name,
        topic: item.topic.title,
        url: `/learn/${item.topic.subject.code.toLowerCase()}/${item.topic.slug}/${item.slug}`
      })));
    }

    if (type === 'topics' || !type) {
      const topics = await Topic.findAll({
        where: {
          isPublished: true,
          [require('sequelize').Op.or]: [
            { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
            { description: { [require('sequelize').Op.iLike]: `%${query}%` } }
          ],
          ...(subjectId && { subjectId })
        },
        include: [{
          model: Subject,
          as: 'subject'
        }],
        limit
      });

      results = results.concat(topics.map(item => ({
        id: item.id,
        title: item.title,
        content: item.description,
        type: 'topic',
        subject: item.subject.name,
        url: `/learn/${item.subject.code.toLowerCase()}/${item.slug}`
      })));
    }

    res.status(200).json({
      success: true,
      data: {
        query,
        results,
        totalCount: results.length
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// Get recommended content for user
const getRecommended = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 5 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const recommendations = await Subtopic.getRecommended(userId, limit);

    res.status(200).json({
      success: true,
      data: {
        recommendations: recommendations.map(item => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          difficulty: item.difficulty,
          estimatedReadTimeMinutes: item.estimatedReadTimeMinutes,
          subject: item.topic.subject.name,
          topic: item.topic.title,
          url: `/learn/${item.topic.subject.code.toLowerCase()}/${item.topic.slug}/${item.slug}`
        })),
        totalCount: recommendations.length
      }
    });
  } catch (error) {
    console.error('Get recommended error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  getSubjectTopics,
  getTopic,
  getSubtopic,
  searchContent,
  getRecommended
};
