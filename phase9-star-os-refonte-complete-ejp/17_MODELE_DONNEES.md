# 17 — Modèle de données

## Objectif

Créer un modèle de données cohérent avec STAR OS.

Les entités doivent séparer :
- identité ;
- agenda ;
- présences ;
- croissance ;
- formations ;
- objectifs ;
- rendez-vous ;
- ressources ;
- parcours ;
- responsabilités ;
- outils métiers ;
- supervision.

## Utilisateurs

### `users`

- id
- first_name
- last_name
- email
- phone
- avatar_url
- banner_url
- account_status
- created_at
- updated_at

### `roles`

- id
- name
- label

Rôles possibles :
- servant
- referent
- leader
- bureau
- bergere
- admin
- fij_pilot
- fij_coordination
- accueil_servant
- communication_servant
- academic_support

### `user_roles`

- id
- user_id
- role_id
- scope_type
- scope_id
- created_at

## Agenda

### `calendar_events`

- id
- title
- description
- event_type
- start_at
- end_at
- location
- visibility_scope
- created_by
- requires_attendance
- created_at
- updated_at

### `event_participants`

- id
- event_id
- user_id
- status
- response_status
- created_at
- updated_at

### `personal_calendar_blocks`

- id
- user_id
- title
- block_type
- start_at
- end_at
- visibility
- created_at
- updated_at

## Présences

### `attendance_responses`

- id
- event_id
- user_id
- status
- reason_category
- comment
- responded_at
- updated_at

Status :
- present_planned
- absent_planned
- late_planned
- present_validated
- absent_justified
- no_response

### `attendance_checkins`

- id
- event_id
- user_id
- checked_in_at
- method
- validated_by
- created_at

## Formations

### `training_programs`

- id
- title
- description
- category
- is_active
- created_at

### `training_modules`

- id
- program_id
- title
- description
- order_index
- video_url
- document_url
- requires_summary
- created_at

### `training_enrollments`

- id
- user_id
- program_id
- status
- progress_percent
- assigned_by
- assigned_at
- completed_at

### `training_summaries`

- id
- user_id
- module_id
- content
- status
- submitted_at
- reviewed_by
- reviewed_at
- review_comment

## Croissance

### `scripture_reading_logs`

- id
- user_id
- date
- passage
- status
- private_note
- created_at

### `personal_notes`

- id
- user_id
- title
- content
- category
- visibility
- shared_with_user_id
- created_at
- updated_at

### `book_logs`

- id
- user_id
- title
- author
- category
- status
- started_at
- finished_at
- personal_note
- recommendation_status

## Objectifs

### `personal_goals`

- id
- user_id
- title
- category
- why
- expected_result
- target_date
- priority
- status
- visibility
- created_at
- updated_at

### `goal_steps`

- id
- goal_id
- title
- due_date
- status
- completed_at

## Rendez-vous

### `appointment_requests`

- id
- requester_id
- request_type
- requested_person_id
- subject
- urgency
- message
- status
- created_at
- updated_at

### `appointment_slots`

- id
- appointment_request_id
- proposed_start_at
- proposed_end_at
- status
- created_by

## Ressources

### `resources`

- id
- title
- description
- category
- resource_type
- url
- file_url
- visibility_scope
- created_by
- is_active
- created_at

### `resource_favorites`

- id
- user_id
- resource_id
- created_at

### `products`

- id
- title
- description
- price
- image_url
- status
- created_at

### `orders`

- id
- user_id
- product_id
- quantity
- status
- payment_status
- created_at

## Parcours

### `servant_journeys`

- id
- user_id
- current_status
- city
- summary
- updated_at

### `education_profiles`

- id
- user_id
- school
- program
- level
- year
- needs_internship
- internship_period
- support_needed
- updated_at

### `work_profiles`

- id
- user_id
- field
- job_title
- schedule_type
- constraints
- updated_at

### `skills`

- id
- user_id
- name
- level
- willing_to_serve_with
- visibility

## Espace personnel

### `user_workspace_preferences`

- id
- user_id
- layout_config
- default_agenda_view
- notification_preferences
- updated_at

### `user_widgets`

- id
- user_id
- widget_type
- position
- is_visible
- config

### `user_shortcuts`

- id
- user_id
- title
- target_url
- icon
- position

## Responsabilités

### `responsibility_assignments`

- id
- user_id
- responsibility_type
- scope_type
- scope_id
- status
- assigned_by
- assigned_at

Types :
- fij_pilot
- fij_coordination
- accueil
- communication
- music
- academic
- coordination
- bureau
- admin

## FIJ

### `fij_groups`

- id
- name
- status
- meeting_day
- meeting_time
- location_label
- pilot_user_id
- copilot_user_id
- created_at
- updated_at

### `fij_members`

- id
- fij_group_id
- first_name
- last_name
- phone
- status
- joined_at
- created_at

### `fij_thursday_reports`

- id
- fij_group_id
- report_date
- submitted_by
- status
- general_comment
- submitted_at
- created_at

### `fij_attendance_lines`

- id
- report_id
- fij_member_id
- status
- comment

### `fij_visitors`

- id
- report_id
- first_name
- last_name
- contact
- comment

### `fij_member_notes`

- id
- fij_member_id
- created_by
- note_type
- content
- visibility_level
- created_at

## Supervision

### `alerts`

- id
- alert_type
- severity
- scope_type
- scope_id
- title
- description
- status
- created_at
- resolved_at

### `announcements`

- id
- title
- content
- audience_scope
- published_at
- expires_at
- created_by

## Règle

Chaque donnée doit avoir :
- un propriétaire ;
- une visibilité ;
- un périmètre ;
- un niveau de confidentialité ;
- des permissions CRUD.
