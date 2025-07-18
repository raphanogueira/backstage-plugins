module.exports = {
  up: function (knex) {
    return knex.schema
      .createTable('analytics', (table) => {
        table.increments('id').primary();
        table.string('action', 255).notNullable();
        table.string('subject', 255).notNullable();
        table.string('path', 255).nullable();
        table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
        table.integer('access_count');
        table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
      })
      .createTable('analytics_metrics_users', (table) => {
        table.increments('id').primary();
        table.integer('analytics_id').notNullable()
          .references('id').inTable('analytics')
          .onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('namespace').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
  },

  down: function (knex) {
    return knex.schema
      .dropTable('analytics_metrics_users')
      .dropTable('analytics');
  }
}; 