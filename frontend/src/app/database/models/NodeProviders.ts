import { DataTypes, Model, Optional } from "sequelize";
import db from "../config/database";

interface NodeProviderAttributes {
  id: number;
  principal_id: string;
  display_name?: string;
  location_count?: number;
  logo_url?: string;
  total_node_allowance?: number;
  total_nodes?: number;
  total_rewardable_nodes?: number;
  total_subnets?: number;
  total_unassigned_nodes?: number;
  website?: string;
  locations?: any; // JSONB field
}

interface NodeProviderCreationAttributes extends Optional<NodeProviderAttributes, "id"> {}

class NodeProviders extends Model<NodeProviderAttributes, NodeProviderCreationAttributes> {
  public id!: number;
  public principal_id!: string;
  public display_name?: string;
  public location_count?: number;
  public logo_url?: string;
  public total_node_allowance?: number;
  public total_nodes?: number;
  public total_rewardable_nodes?: number;
  public total_subnets?: number;
  public total_unassigned_nodes?: number;
  public website?: string;
  public locations?: any;

  // timestamps!
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

NodeProviders.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    principal_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_node_allowance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_rewardable_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_subnets: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_unassigned_nodes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locations: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "node_providers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default NodeProviders;
