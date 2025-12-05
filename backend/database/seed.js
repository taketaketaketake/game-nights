import pool from '../src/config/db.js';

async function seed() {
  try {
    console.log('🌱 Seeding database with sample data...');

    // Create sample users
    const users = await pool.query(`
      INSERT INTO users (auth0_id, username, email, avatar_url, total_points, total_wins)
      VALUES
        ('auth0|sample1', 'GameMasterJake', 'jake@example.com', null, 2500, 5),
        ('auth0|sample2', 'ArtisticAmy', 'amy@example.com', null, 1800, 3),
        ('auth0|sample3', 'TriviaKing', 'king@example.com', null, 3200, 8),
        ('auth0|sample4', 'SpeedRunner', 'speed@example.com', null, 1200, 2)
      ON CONFLICT (auth0_id) DO NOTHING
      RETURNING id, username
    `);

    console.log(`✅ Created ${users.rowCount} sample users`);

    // Create sample games
    const games = await pool.query(`
      INSERT INTO games (host_id, title, description, scheduled_time, stream_platform, status, prize_pool)
      VALUES
        (
          (SELECT id FROM users WHERE username = 'GameMasterJake' LIMIT 1),
          'Tuesday Night Trivia Showdown',
          'Test your knowledge across pop culture, science, history and more!',
          NOW() + INTERVAL '2 days',
          'twitch',
          'scheduled',
          500.00
        ),
        (
          (SELECT id FROM users WHERE username = 'ArtisticAmy' LIMIT 1),
          'Draw-Off Championship',
          'Show off your artistic skills in rapid-fire drawing challenges!',
          NOW() + INTERVAL '3 days',
          'youtube',
          'scheduled',
          250.00
        ),
        (
          (SELECT id FROM users WHERE username = 'TriviaKing' LIMIT 1),
          'Friday Night Game Night',
          'Mixed challenges: trivia, drawing, and physical challenges!',
          NOW() + INTERVAL '5 days',
          'twitch',
          'scheduled',
          750.00
        )
      ON CONFLICT DO NOTHING
      RETURNING id, title
    `);

    console.log(`✅ Created ${games.rowCount} sample games`);

    // Create sample questions for first game
    const firstGame = await pool.query(`
      SELECT id FROM games ORDER BY created_at LIMIT 1
    `);

    if (firstGame.rows.length > 0) {
      const gameId = firstGame.rows[0].id;

      await pool.query(`
        INSERT INTO questions (game_id, question_type, question_text, correct_answer, wrong_answers, points, time_limit, order_index)
        VALUES
          ($1, 'multiple_choice', 'What is the capital of France?', 'Paris',
           '["London", "Berlin", "Madrid"]'::jsonb, 100, 15, 1),
          ($1, 'multiple_choice', 'Which planet is known as the Red Planet?', 'Mars',
           '["Venus", "Jupiter", "Saturn"]'::jsonb, 100, 15, 2),
          ($1, 'multiple_choice', 'Who painted the Mona Lisa?', 'Leonardo da Vinci',
           '["Michelangelo", "Raphael", "Donatello"]'::jsonb, 100, 20, 3),
          ($1, 'multiple_choice', 'What is the largest ocean on Earth?', 'Pacific Ocean',
           '["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"]'::jsonb, 100, 15, 4),
          ($1, 'multiple_choice', 'In what year did World War II end?', '1945',
           '["1944", "1946", "1943"]'::jsonb, 150, 20, 5)
        ON CONFLICT DO NOTHING
      `, [gameId]);

      console.log('✅ Created sample questions');
    }

    console.log('🎉 Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
