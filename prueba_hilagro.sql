--
-- PostgreSQL database dump
--

\restrict JSm4WfJPiZ0dGdtGgT3QUArybeulxkCPuyZbUYEj170noEgvVXH4L8KU4c2Kv68

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: role_name; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role_name AS ENUM (
    'super_admin',
    'supervisor',
    'vendedor'
);


ALTER TYPE public.role_name OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    person_id uuid NOT NULL,
    firebase_uid text NOT NULL,
    email text
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- Name: person; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.person (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.person OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    name public.role_name NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: route; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_user_id uuid NOT NULL,
    route_date date NOT NULL,
    name text
);


ALTER TABLE public.route OWNER TO postgres;

--
-- Name: route_point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_point (
    route_id uuid NOT NULL,
    seq integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    visited_at timestamp with time zone
);


ALTER TABLE public.route_point OWNER TO postgres;

--
-- Name: supervisor_vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supervisor_vendor (
    supervisor_user_id uuid NOT NULL,
    vendor_user_id uuid NOT NULL,
    CONSTRAINT supervisor_vendor_check CHECK ((supervisor_user_id <> vendor_user_id))
);


ALTER TABLE public.supervisor_vendor OWNER TO postgres;

--
-- Name: user_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role (
    user_id uuid NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_role OWNER TO postgres;

--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (id, person_id, firebase_uid, email) FROM stdin;
e78186fb-0443-41b5-8c6e-158a908aad67	c09b4d5d-ae1a-4bec-81d5-304e5b1bea69	JLY3JhAQFNduV876fLOft6cGUBq2	super2@demo.com
efe289c6-090b-4180-b935-25198c0f03ea	11b22fbd-a2f1-4307-a1b8-811d6b7d8014	io8KvdKa9fbx5UQiC48kiM3Smtz1	admin@demo.com
0117e889-d222-4a1d-ae0d-561433e36688	e4e26fc7-7f55-4f18-88bc-ce43a235ac39	YBq14iDhUYNMrrw2FBi5WikhHtW2	super1@demo.com
8a97be4e-e5b3-46d9-b93c-ab83e8bc4197	95910e8d-ea26-4e6c-bb37-5ed54c8ddec9	jEfvt03RXnhLEEfjdrfrn0lXR3O2	vend1@demo.com
4b394043-bfe5-4577-9ca8-37e1d6b988b3	3d4979cb-7d8d-4f00-9d4d-0b55618d627b	TEMP_1762129637777	xd@demo.com
d971ab60-e008-47e2-8612-07c82716fe55	b1115ea4-6879-4261-8652-e08fd692ffbe	KYGYxp2HopQPOoCrkJD2z4NIcZp2	vend3@demo.com
aa79917c-67bb-4e21-95ab-de4276dd35c7	f8e43bbd-deaf-4290-85ef-fe063b1b11dc	IUUC1xdPbbfQB096Af4n71XvOk13	vend2@demo.com
72ec9d6e-9c05-4ddd-886a-fc7326092500	e7cc3917-5dd9-48c9-a94d-3492fb34c113	abFbiFyMWSPldZiH83FxJvhySWv2	testt@demo.com
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.person (id, first_name, last_name, created_at) FROM stdin;
c09b4d5d-ae1a-4bec-81d5-304e5b1bea69	Supervisor2	Dos	2025-11-02 20:34:24.298322-03
e4e26fc7-7f55-4f18-88bc-ce43a235ac39	Supervisor1	Uno	2025-11-02 19:24:55.647402-03
11b22fbd-a2f1-4307-a1b8-811d6b7d8014	Admin	Nistrador	2025-11-02 19:24:55.647402-03
95910e8d-ea26-4e6c-bb37-5ed54c8ddec9	Vendedor1	Uno	2025-11-02 19:24:55.647402-03
3d4979cb-7d8d-4f00-9d4d-0b55618d627b	abcdef	ghi	2025-11-02 21:27:17.774532-03
b1115ea4-6879-4261-8652-e08fd692ffbe	Vendedor3ab	Tres	2025-11-02 20:29:41.553096-03
f8e43bbd-deaf-4290-85ef-fe063b1b11dc	Vendedor2ab	Dos	2025-11-02 19:24:55.647402-03
e7cc3917-5dd9-48c9-a94d-3492fb34c113	testt	con contrasenha	2025-11-02 22:19:58.240563-03
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, name) FROM stdin;
1	super_admin
2	supervisor
3	vendedor
\.


--
-- Data for Name: route; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route (id, vendor_user_id, route_date, name) FROM stdin;
\.


--
-- Data for Name: route_point; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route_point (route_id, seq, latitude, longitude, visited_at) FROM stdin;
\.


--
-- Data for Name: supervisor_vendor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisor_vendor (supervisor_user_id, vendor_user_id) FROM stdin;
0117e889-d222-4a1d-ae0d-561433e36688	8a97be4e-e5b3-46d9-b93c-ab83e8bc4197
e78186fb-0443-41b5-8c6e-158a908aad67	aa79917c-67bb-4e21-95ab-de4276dd35c7
e78186fb-0443-41b5-8c6e-158a908aad67	d971ab60-e008-47e2-8612-07c82716fe55
e78186fb-0443-41b5-8c6e-158a908aad67	4b394043-bfe5-4577-9ca8-37e1d6b988b3
0117e889-d222-4a1d-ae0d-561433e36688	72ec9d6e-9c05-4ddd-886a-fc7326092500
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role (user_id, role_id) FROM stdin;
efe289c6-090b-4180-b935-25198c0f03ea	1
0117e889-d222-4a1d-ae0d-561433e36688	2
8a97be4e-e5b3-46d9-b93c-ab83e8bc4197	3
aa79917c-67bb-4e21-95ab-de4276dd35c7	3
d971ab60-e008-47e2-8612-07c82716fe55	3
e78186fb-0443-41b5-8c6e-158a908aad67	2
4b394043-bfe5-4577-9ca8-37e1d6b988b3	3
72ec9d6e-9c05-4ddd-886a-fc7326092500	3
\.


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_id_seq', 3, true);


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (id);


--
-- Name: role role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_name_key UNIQUE (name);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: route route_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route
    ADD CONSTRAINT route_pkey PRIMARY KEY (id);


--
-- Name: route_point route_point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_point
    ADD CONSTRAINT route_point_pkey PRIMARY KEY (route_id, seq);


--
-- Name: supervisor_vendor supervisor_vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_vendor
    ADD CONSTRAINT supervisor_vendor_pkey PRIMARY KEY (supervisor_user_id, vendor_user_id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: app_user app_user_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.person(id) ON DELETE CASCADE;


--
-- Name: route_point route_point_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_point
    ADD CONSTRAINT route_point_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(id) ON DELETE CASCADE;


--
-- Name: route route_vendor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route
    ADD CONSTRAINT route_vendor_user_id_fkey FOREIGN KEY (vendor_user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: supervisor_vendor supervisor_vendor_supervisor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_vendor
    ADD CONSTRAINT supervisor_vendor_supervisor_user_id_fkey FOREIGN KEY (supervisor_user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: supervisor_vendor supervisor_vendor_vendor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_vendor
    ADD CONSTRAINT supervisor_vendor_vendor_user_id_fkey FOREIGN KEY (vendor_user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.role(id) ON DELETE CASCADE;


--
-- Name: user_role user_role_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_user(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JSm4WfJPiZ0dGdtGgT3QUArybeulxkCPuyZbUYEj170noEgvVXH4L8KU4c2Kv68

