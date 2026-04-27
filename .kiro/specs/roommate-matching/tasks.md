# Implementation Plan: Roommate Matching System

## Overview

This implementation plan breaks down the Roommate Matching feature into discrete, actionable coding tasks. The feature enables tenants to discover compatible roommates through a multi-factor scoring algorithm, connect via requests, chat in real-time, form groups, and search for properties together. The implementation follows a bottom-up approach: data models → core services → API endpoints → real-time features → integrations.

## Tasks

- [ ] 1. Set up data models and database schemas
  - [ ] 1.1 Create RoommateProfile model with Mongoose schema
    - Define schema with budget range, location preferences, lifestyle preferences, occupation details, move-in dates, roommate preferences, bio, interests, privacy settings, and computed completeness
    - Add indexes on userId, isComplete, privacySetting, and locationPreference.cities
    - Implement pre-save hook to compute profileCompleteness percentage
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 9.1_
  
  - [ ]* 1.2 Write property test for profile completeness calculation
    - **Property 1: Profile Completeness Calculation**
    - **Validates: Requirements 1.12**
  
  - [ ] 1.3 Create RoommateRequest model with Mongoose schema
    - Define schema with senderId, receiverId, message, propertyId, status, expiresAt timestamps
    - Add indexes on senderId, receiverId, status, and expiresAt
    - Add compound index on [senderId, receiverId] for duplicate prevention
    - _Requirements: 4.1, 4.8_
  
  - [ ] 1.4 Create RoommateConnection model with Mongoose schema
    - Define schema with user1Id, user2Id, requestId, chatId, compatibilityScore, timestamps
    - Add indexes on user1Id, user2Id, and compound index on [user1Id, user2Id]
    - _Requirements: 4.5_
  
  - [ ] 1.5 Create RoommateChat and RoommateMessage models with Mongoose schemas
    - Define RoommateChat schema with connectionId, participants array, lastMessage, unreadCount map
    - Define RoommateMessage schema with chatId, senderId, content, type, mediaUrl, reactions array, seenBy array
    - Add indexes on chatId, senderId, and createdAt for message queries
    - _Requirements: 5.1, 5.2, 5.3, 5.9_

