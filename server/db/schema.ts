import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'

export const apis = sqliteTable("apis", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  group: text("group").notNull().default("Build"),
  countries: text("countries").notNull().default("[]"),
  provider: text("provider").notNull(),
  source: text("source"),
  sourceUrl: text("source_url"),
  tier: text("tier").notNull().default("open"),
  kind: text("kind").notNull().default("api"),
  auth: text("auth").notNull().default("none"),
  copyable: integer("copyable", { mode: "boolean" }).default(true),
  pricing: text("pricing").notNull().default("free"),
  docs: text("docs"),
  baseUrl: text("base_url"),
  frequency: text("frequency"),
  coverage: text("coverage"),
  note: text("note"),
  attributes: text("attributes"),
  createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
  updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
  submittedBy: text("submitted_by"),
  verifiedAt: text("verified_at"),
}, (table) => [
  index("idx_apis_category").on(table.category),
  index("idx_apis_tier").on(table.tier),
  index("idx_apis_auth").on(table.auth),
  index("idx_apis_pricing").on(table.pricing),
])

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  groupName: text("group_name").notNull().default("Build"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0),
})

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

export const apiTags = sqliteTable("api_tags", {
  apiId: text("api_id").notNull().references(() => apis.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
})

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  data: text("data").notNull(),
  status: text("status").notNull().default("pending"),
  submittedBy: text("submitted_by"),
  submittedAt: text("submitted_at").notNull().default(sql`(current_timestamp)`),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  reviewNotes: text("review_notes"),
})

export const apiSnippets = sqliteTable("api_snippets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  apiId: text("api_id").notNull().references(() => apis.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  code: text("code").notNull(),
})
