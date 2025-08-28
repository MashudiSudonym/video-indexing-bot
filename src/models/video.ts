import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';

// Membuat koneksi ke database SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false, // Set ke true jika ingin melihat query SQL
});

// Definisi model Video
class Video extends Model {
  public id!: number;
  public file_id!: string;
  public file_name!: string;
  public duration!: number; // dalam detik
  public mime_type!: string;
  public file_size!: number;
  public message_id!: number;
  public chat_id!: number;
  public date!: Date;
  public response_message_id!: number; // untuk menyimpan message_id response bot

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Video.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  file_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  chat_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  response_message_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  sequelize,
  tableName: 'videos',
  timestamps: true,
});

export { sequelize, Video };