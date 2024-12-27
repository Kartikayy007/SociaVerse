import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Space, SpaceType, MemberRole } from '../src/models/Space';
import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

describe('Space Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testToken: string;
  let testUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
    // Create test user token
    testUserId = new mongoose.Types.ObjectId().toString();
    testToken = jwt.sign({ id: testUserId }, process.env.JWT_SECRET || 'test-secret');
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Space.deleteMany({});
  });

  describe('Space Model', () => {
    it('should create a space with valid data', async () => {
      const space = await Space.create({
        name: 'Test Space',
        description: 'Test Description',
        type: SpaceType.PRIVATE,
        ownerId: testUserId,
        members: [{
          userId: testUserId,
          role: MemberRole.OWNER,
          joinedAt: new Date()
        }]
      });

      expect(space.name).toBe('Test Space');
      expect(space.inviteCode).toBeDefined();
      expect(space.members).toHaveLength(1);
    });

    it('should enforce member limit', async () => {
      const space = new Space({
        name: 'Test Space',
        description: 'Test Description',
        maxMembers: 2,
        ownerId: testUserId
      });

      space.members = Array(3).fill({
        userId: new mongoose.Types.ObjectId(),
        role: MemberRole.MEMBER
      });

      await expect(space.save()).rejects.toThrow('MaxCapacityError');
    });
  });

  describe('Space Routes', () => {
    it('should create a new space', async () => {
      const response = await request(app)
        .post('/api/v1/spaces')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Space',
          description: 'Test Description',
          type: SpaceType.PRIVATE
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Test Space');
    });

    it('should join space with invite code', async () => {
      const space = await Space.create({
        name: 'Test Space',
        description: 'Test Description',
        ownerId: testUserId,
        members: [{ userId: testUserId, role: MemberRole.OWNER }]
      });

      const response = await request(app)
        .post(`/api/v1/spaces/join-by-code/${space.inviteCode}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
    });
  });
});