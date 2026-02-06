'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sessions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('user', 'assistant', 'system'),
        allowNull: false,
        comment: 'Who sent the message: user, assistant (AI), or system'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The actual message content'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata (model used, tokens, temperature, etc.)'
      },
      tokens_used: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Number of tokens used for this message (for assistant messages)'
      },
      processing_time_ms: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Time taken to process this message in milliseconds'
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if processing failed'
      },
      parent_message_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'messages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'For branching conversations or edits'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('messages', ['session_id']);
    await queryInterface.addIndex('messages', ['role']);
    await queryInterface.addIndex('messages', ['created_at']);
    await queryInterface.addIndex('messages', ['parent_message_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  }
};
