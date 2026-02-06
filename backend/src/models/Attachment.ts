import { DataTypes, Model, Sequelize, Optional } from 'sequelize';

type AttachmentType = 'image' | 'document' | 'pdf' | 'code' | 'chart' | 'graph' | 'table' | 'audio' | 'video' | 'other';
type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface AttachmentAttributes {
  id: string;
  messageId: string;
  type: AttachmentType;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  storagePath?: string;
  storageUrl?: string;
  content?: string;
  metadata?: Record<string, any>;
  isGenerated: boolean;
  processingStatus: ProcessingStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttachmentCreationAttributes extends Optional<AttachmentAttributes, 'id' | 'mimeType' | 'fileName' | 'fileSize' | 'storagePath' | 'storageUrl' | 'content' | 'metadata' | 'isGenerated' | 'processingStatus' | 'createdAt' | 'updatedAt'> {}

class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: string;
  public messageId!: string;
  public type!: AttachmentType;
  public mimeType?: string;
  public fileName?: string;
  public fileSize?: number;
  public storagePath?: string;
  public storageUrl?: string;
  public content?: string;
  public metadata?: Record<string, any>;
  public isGenerated!: boolean;
  public processingStatus!: ProcessingStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize): typeof Attachment {
    Attachment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false
        },
        messageId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'message_id'
        },
        type: {
          type: DataTypes.ENUM('image', 'document', 'pdf', 'code', 'chart', 'graph', 'table', 'audio', 'video', 'other'),
          allowNull: false
        },
        mimeType: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: 'mime_type'
        },
        fileName: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'file_name'
        },
        fileSize: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'file_size'
        },
        storagePath: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'storage_path'
        },
        storageUrl: {
          type: DataTypes.STRING(1000),
          allowNull: true,
          field: 'storage_url'
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        metadata: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: {}
        },
        isGenerated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: 'is_generated'
        },
        processingStatus: {
          type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'completed',
          field: 'processing_status'
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at'
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at'
        }
      },
      {
        sequelize,
        tableName: 'attachments',
        timestamps: true,
        underscored: true
      }
    );

    return Attachment;
  }
}

export default Attachment;
