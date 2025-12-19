const { sequelize } = require('../src/config/database');
const Subject = require('../src/models/Subject');
const Topic = require('../src/models/Topic');
const Subtopic = require('../src/models/Subtopic');
const ChatSession = require('../src/models/ChatSession');
const ChatMessage = require('../src/models/ChatMessage');
const User = require('../src/models/User');

async function seedSubjects() {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database (create tables)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    // Seed subjects
    const subjects = [
      {
        name: 'Mathematics',
        code: 'MATH',
        level: 'O-Level',
        category: 'core',
        description: 'Numbers, Algebra, Geometry, Calculus - Complete UNEB Mathematics curriculum',
        colorHex: '#3B82F6',
        displayOrder: 1,
        unebCode: 'MAT'
      },
      {
        name: 'Physics',
        code: 'PHYS',
        level: 'O-Level',
        category: 'core',
        description: 'Mechanics, Waves, Electricity, Magnetism - Understanding the physical world',
        colorHex: '#8B5CF6',
        displayOrder: 2,
        unebCode: 'PHY'
      },
      {
        name: 'Chemistry',
        code: 'CHEM',
        level: 'O-Level',
        category: 'core',
        description: 'Matter, Atoms, Reactions, Organic Chemistry - The science of substances',
        colorHex: '#10B981',
        displayOrder: 3,
        unebCode: 'CHE'
      },
      {
        name: 'Biology',
        code: 'BIO',
        level: 'O-Level',
        category: 'core',
        description: 'Cells, Nutrition, Reproduction, Ecology - The study of living organisms',
        colorHex: '#F59E0B',
        displayOrder: 4,
        unebCode: 'BIO'
      },
      {
        name: 'English Language',
        code: 'ENG',
        level: 'O-Level',
        category: 'core',
        description: 'Grammar, Writing, Reading, Literature - Mastering English communication',
        colorHex: '#EF4444',
        displayOrder: 5,
        unebCode: 'ENG'
      },
      {
        name: 'Geography',
        code: 'GEO',
        level: 'O-Level',
        category: 'humanities',
        description: 'Physical, Human, Economic Geography - Understanding our world',
        colorHex: '#06B6D4',
        displayOrder: 6,
        unebCode: 'GEO'
      },
      {
        name: 'History',
        code: 'HIST',
        level: 'O-Level',
        category: 'humanities',
        description: 'Ugandan, East African, World History - Learning from the past',
        colorHex: '#8B5A2B',
        displayOrder: 7,
        unebCode: 'HIS'
      },
      {
        name: 'Commerce',
        code: 'COMM',
        level: 'O-Level',
        category: 'applied',
        description: 'Accounting, Business Studies - Preparing for business success',
        colorHex: '#059669',
        displayOrder: 8,
        unebCode: 'COM'
      }
    ];

    console.log('📚 Seeding subjects...');
    for (const subjectData of subjects) {
      const [subject, created] = await Subject.findOrCreate({
        where: { code: subjectData.code },
        defaults: subjectData
      });

      if (created) {
        console.log(`✅ Created subject: ${subject.name}`);
      } else {
        console.log(`⏭️  Subject already exists: ${subject.name}`);
      }
    }

    // Seed Mathematics topics
    const mathSubject = await Subject.findByCode('MATH');
    if (mathSubject) {
      const mathTopics = [
        {
          title: 'Numbers and Operations',
          slug: 'numbers-operations',
          description: 'Whole numbers, integers, fractions, decimals, percentages',
          classLevel: 'S1',
          term: 1,
          difficulty: 'beginner',
          estimatedDurationMinutes: 180,
          displayOrder: 1,
          isPublished: true
        },
        {
          title: 'Algebraic Expressions',
          slug: 'algebraic-expressions',
          description: 'Simplifying expressions, expanding brackets, factorizing',
          classLevel: 'S1',
          term: 2,
          difficulty: 'beginner',
          estimatedDurationMinutes: 240,
          displayOrder: 2,
          isPublished: true
        },
        {
          title: 'Linear Equations',
          slug: 'linear-equations',
          description: 'Solving one-variable equations, word problems',
          classLevel: 'S1',
          term: 3,
          difficulty: 'intermediate',
          estimatedDurationMinutes: 300,
          displayOrder: 3,
          isPublished: true
        },
        {
          title: 'Quadratic Equations',
          slug: 'quadratic-equations',
          description: 'Solving quadratics by factorization, formula, completing square',
          classLevel: 'S2',
          term: 1,
          difficulty: 'intermediate',
          estimatedDurationMinutes: 360,
          displayOrder: 4,
          isPublished: true
        },
        {
          title: 'Geometry - Lines and Angles',
          slug: 'geometry-lines-angles',
          description: 'Parallel lines, triangles, polygons, circle theorems',
          classLevel: 'S2',
          term: 2,
          difficulty: 'intermediate',
          estimatedDurationMinutes: 420,
          displayOrder: 5,
          isPublished: true
        }
      ];

      console.log('🔢 Seeding Mathematics topics...');
      for (const topicData of mathTopics) {
        const [topic, created] = await Topic.findOrCreate({
          where: {
            subjectId: mathSubject.id,
            slug: topicData.slug
          },
          defaults: {
            ...topicData,
            subjectId: mathSubject.id
          }
        });

        if (created) {
          console.log(`✅ Created topic: ${topic.title}`);
        }
      }
    }

    // Seed sample subtopics for Quadratic Equations
    const quadraticTopic = await Topic.findOne({
      where: { subjectId: mathSubject.id, slug: 'quadratic-equations' }
    });

    if (quadraticTopic) {
      const quadraticSubtopics = [
        {
          title: 'Introduction to Quadratic Equations',
          slug: 'introduction',
          content: `# Introduction to Quadratic Equations

A **quadratic equation** is an equation of the form:

**ax² + bx + c = 0**

Where:
- **a** is the coefficient of x² (a ≠ 0)
- **b** is the coefficient of x
- **c** is the constant term

## Ugandan Context Example

Imagine you're a boda boda rider in Kampala. Your daily earnings (E) depend on the number of trips (t) you make:

**E = 50t - 2t²**

This is a quadratic equation because of the t² term. The -2t² shows that as you make more trips, you get tired and earn less per trip.

## Key Points
- Quadratic equations have a squared term
- They can have 0, 1, or 2 solutions
- The graph is always a parabola
- Used in physics, engineering, and business`,
          summary: 'Understanding what quadratic equations are and their real-world applications',
          estimatedReadTimeMinutes: 15,
          difficulty: 'beginner',
          displayOrder: 1,
          isPublished: true
        },
        {
          title: 'Solving by Factorization',
          slug: 'factorization-method',
          content: `# Solving Quadratic Equations by Factorization

To solve ax² + bx + c = 0 by factorization:

1. **Write in standard form**: ax² + bx + c = 0
2. **Factor the quadratic**: Find two numbers that multiply to give ac and add to give b
3. **Set each factor to zero**: (x + m)(x + n) = 0
4. **Solve**: x = -m or x = -n

## Example: Solve x² + 5x + 6 = 0

**Step 1:** Factors of 6 that add to 5: 2 and 3
**Step 2:** (x + 2)(x + 3) = 0
**Step 3:** x + 2 = 0 or x + 3 = 0
**Step 4:** x = -2 or x = -3

## Ugandan Market Example

A vendor sells tomatoes. His profit P depends on price x:

**P = -2x² + 20x - 45**

To maximize profit, solve the quadratic equation found by taking the derivative.

**Solution:** x = 5 (price should be 5,000 UGX per kg)`,
          summary: 'Step-by-step method to factorize and solve quadratic equations',
          estimatedReadTimeMinutes: 25,
          difficulty: 'intermediate',
          displayOrder: 2,
          isPublished: true
        },
        {
          title: 'The Quadratic Formula',
          slug: 'quadratic-formula',
          content: `# The Quadratic Formula

For any quadratic equation ax² + bx + c = 0, the solutions are:

**x = (-b ± √(b² - 4ac)) / 2a**

Where:
- **b² - 4ac** is called the **discriminant**
- If discriminant > 0: Two real solutions
- If discriminant = 0: One repeated solution
- If discriminant < 0: No real solutions

## Example: Solve 2x² + 5x - 3 = 0

**Given:** a = 2, b = 5, c = -3

**Discriminant:** D = b² - 4ac = 25 - 4(2)(-3) = 25 + 24 = 49

**Solutions:**
x = (-5 ± √49) / 4 = (-5 ± 7) / 4

**x₁ = (-5 + 7) / 4 = 2/4 = 0.5**
**x₂ = (-5 - 7) / 4 = -12/4 = -3**

## Physics Application

A ball thrown upwards reaches height h = -5t² + 20t + 1.5

When does it hit the ground? Solve -5t² + 20t + 1.5 = 0

**Answer:** t ≈ 4.1 seconds (using quadratic formula)`,
          summary: 'The universal method for solving any quadratic equation',
          estimatedReadTimeMinutes: 30,
          difficulty: 'intermediate',
          displayOrder: 3,
          isPublished: true
        }
      ];

      console.log('🔢 Seeding Quadratic Equations subtopics...');
      for (const subtopicData of quadraticSubtopics) {
        const [subtopic, created] = await Subtopic.findOrCreate({
          where: {
            topicId: quadraticTopic.id,
            slug: subtopicData.slug
          },
          defaults: {
            ...subtopicData,
            topicId: quadraticTopic.id
          }
        });

        if (created) {
          console.log(`✅ Created subtopic: ${subtopic.title}`);
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Subjects: ${subjects.length}`);
    console.log(`   - Math Topics: ${mathTopics?.length || 0}`);
    console.log(`   - Sample Subtopics: ${quadraticSubtopics?.length || 0}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedSubjects()
    .then(() => {
      console.log('✅ Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedSubjects;
