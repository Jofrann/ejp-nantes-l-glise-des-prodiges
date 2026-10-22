import assert from 'node:assert/strict';
import test from 'node:test';
import { getNextService } from '../src/lib/publicSchedule.js';
test('public service uses the configured day and Nantes time',()=>{assert.equal(getNextService({service_day:'Samedi',service_time:'18:30'},new Date('2026-10-16T12:00:00Z')).toISOString(),'2026-10-17T16:30:00.000Z');});
test('public calendar follows Paris daylight-saving transitions',()=>{assert.equal(getNextService({service_day:'Dimanche',service_time:'15:00'},new Date('2026-10-24T12:00:00Z')).toISOString(),'2026-10-25T14:00:00.000Z');assert.equal(getNextService({service_day:'Dimanche',service_time:'15:00'},new Date('2026-03-28T12:00:00Z')).toISOString(),'2026-03-29T13:00:00.000Z');});
test('past service advances one week, future service stays today',()=>{const c={service_day:'Dimanche',service_time:'15:00'};assert.equal(getNextService(c,new Date('2026-10-18T12:00:00Z')).toISOString(),'2026-10-18T13:00:00.000Z');assert.equal(getNextService(c,new Date('2026-10-18T14:00:00Z')).toISOString(),'2026-10-25T14:00:00.000Z');});
