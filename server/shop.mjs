import { db, entities } from './store.mjs';
import { randomUUID } from 'node:crypto';
db.exec('CREATE TABLE IF NOT EXISTS shop_subscriptions(user_id TEXT PRIMARY KEY, created_at INTEGER, notified INTEGER DEFAULT 0)');
export async function subscribeShop(user) {
  db.prepare('INSERT INTO shop_subscriptions(user_id,created_at) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING').run(user.id,Date.now());
  return {success:true, channel:'in_app'};
}
export async function notifyShopOpening() {
  const products = await entities.StarProduct.filter({is_active:true});
  if (!products.length) return;
  db.exec('BEGIN IMMEDIATE');
  try {
    for (const subscription of db.prepare('SELECT user_id FROM shop_subscriptions WHERE notified=0').all()) {
      const timestamp = new Date().toISOString();
      const notification = {id:randomUUID(),created_date:timestamp,updated_date:timestamp,user_id:subscription.user_id,created_by_id:subscription.user_id,title:'La boutique EJP est ouverte',message:'Découvre les produits disponibles dans la boutique.',notification_type:'system',link:'/app/ressources/boutique',is_read:false};
      db.prepare('INSERT INTO records(entity,id,data) VALUES(?,?,?)').run('StarNotification',notification.id,JSON.stringify(notification));
      db.prepare('UPDATE shop_subscriptions SET notified=1 WHERE user_id=?').run(subscription.user_id);
    }
    db.exec('COMMIT');
  } catch(error) { db.exec('ROLLBACK'); throw error; }
}
