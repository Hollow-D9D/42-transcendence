--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1
-- Dumped by pg_dump version 15.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'offline',
    'online',
    'looking for a game',
    'In game'
);


ALTER TYPE public.status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement (
    achievement_id integer NOT NULL,
    achievement_name character varying(25) NOT NULL,
    achievement_icon character varying(50) NOT NULL,
    achievement_description character varying(255) NOT NULL,
    achievement_level integer NOT NULL,
    achievement_progress integer NOT NULL
);


ALTER TABLE public.achievement OWNER TO postgres;

--
-- Name: achievement_achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievement_achievement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.achievement_achievement_id_seq OWNER TO postgres;

--
-- Name: achievement_achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievement_achievement_id_seq OWNED BY public.achievement.achievement_id;


--
-- Name: achievement_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievement_list (
    user_id integer,
    achievement_id integer
);


ALTER TABLE public.achievement_list OWNER TO postgres;

--
-- Name: blocked_user_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_user_list (
    who_blocked_id integer,
    who_got_blocked_id integer
);


ALTER TABLE public.blocked_user_list OWNER TO postgres;

--
-- Name: conversation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversation (
    conversation_id integer NOT NULL
);


ALTER TABLE public.conversation OWNER TO postgres;

--
-- Name: conversation_conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conversation_conversation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conversation_conversation_id_seq OWNER TO postgres;

--
-- Name: conversation_conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conversation_conversation_id_seq OWNED BY public.conversation.conversation_id;


--
-- Name: friend; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friend (
    friend_id integer,
    friend_list_id integer
);


ALTER TABLE public.friend OWNER TO postgres;

--
-- Name: friend_list; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friend_list (
    friend_list_id integer NOT NULL
);


ALTER TABLE public.friend_list OWNER TO postgres;

--
-- Name: friend_list_friend_list_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.friend_list_friend_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.friend_list_friend_list_id_seq OWNER TO postgres;

--
-- Name: friend_list_friend_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.friend_list_friend_list_id_seq OWNED BY public.friend_list.friend_list_id;


--
-- Name: game_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_profile (
    game_profile_id integer NOT NULL,
    game_profile_status public.status NOT NULL,
    win_count integer NOT NULL,
    lose_count integer NOT NULL,
    ladder_level integer NOT NULL
);


ALTER TABLE public.game_profile OWNER TO postgres;

--
-- Name: game_profile_game_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_profile_game_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_profile_game_profile_id_seq OWNER TO postgres;

--
-- Name: game_profile_game_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_profile_game_profile_id_seq OWNED BY public.game_profile.game_profile_id;


--
-- Name: match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match (
    match_id integer NOT NULL,
    winner_id integer NOT NULL,
    loser_id integer NOT NULL,
    played_on timestamp without time zone NOT NULL,
    winner_score integer NOT NULL,
    loser_score integer NOT NULL,
    duration integer NOT NULL,
    ladder_level integer NOT NULL
);


ALTER TABLE public.match OWNER TO postgres;

--
-- Name: match_match_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_match_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.match_match_id_seq OWNER TO postgres;

--
-- Name: match_match_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_match_id_seq OWNED BY public.match.match_id;


--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    user_id integer NOT NULL,
    nickname character varying(25) NOT NULL,
    avatar_image character varying(50) NOT NULL,
    two_factor_auth boolean NOT NULL,
    friend_list_id integer NOT NULL,
    game_profile_id integer NOT NULL,
    conversation_ids character varying(500) NOT NULL
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: player_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.player_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.player_user_id_seq OWNER TO postgres;

--
-- Name: player_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.player_user_id_seq OWNED BY public.player.user_id;


--
-- Name: single_message; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.single_message (
    single_message_id integer NOT NULL,
    single_message_user_id integer,
    single_message_conversation_id integer,
    single_message_text character varying(500) NOT NULL,
    single_message_sent_on timestamp without time zone NOT NULL
);


ALTER TABLE public.single_message OWNER TO postgres;

--
-- Name: single_message_single_message_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.single_message_single_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.single_message_single_message_id_seq OWNER TO postgres;

--
-- Name: single_message_single_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.single_message_single_message_id_seq OWNED BY public.single_message.single_message_id;


--
-- Name: achievement achievement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement ALTER COLUMN achievement_id SET DEFAULT nextval('public.achievement_achievement_id_seq'::regclass);


--
-- Name: conversation conversation_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation ALTER COLUMN conversation_id SET DEFAULT nextval('public.conversation_conversation_id_seq'::regclass);


--
-- Name: friend_list friend_list_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_list ALTER COLUMN friend_list_id SET DEFAULT nextval('public.friend_list_friend_list_id_seq'::regclass);


--
-- Name: game_profile game_profile_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_profile ALTER COLUMN game_profile_id SET DEFAULT nextval('public.game_profile_game_profile_id_seq'::regclass);


--
-- Name: match match_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match ALTER COLUMN match_id SET DEFAULT nextval('public.match_match_id_seq'::regclass);


--
-- Name: player user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player ALTER COLUMN user_id SET DEFAULT nextval('public.player_user_id_seq'::regclass);


--
-- Name: single_message single_message_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.single_message ALTER COLUMN single_message_id SET DEFAULT nextval('public.single_message_single_message_id_seq'::regclass);


--
-- Data for Name: achievement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement (achievement_id, achievement_name, achievement_icon, achievement_description, achievement_level, achievement_progress) FROM stdin;
\.


--
-- Data for Name: achievement_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievement_list (user_id, achievement_id) FROM stdin;
\.


--
-- Data for Name: blocked_user_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_user_list (who_blocked_id, who_got_blocked_id) FROM stdin;
\.


--
-- Data for Name: conversation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversation (conversation_id) FROM stdin;
\.


--
-- Data for Name: friend; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friend (friend_id, friend_list_id) FROM stdin;
\.


--
-- Data for Name: friend_list; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.friend_list (friend_list_id) FROM stdin;
\.


--
-- Data for Name: game_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_profile (game_profile_id, game_profile_status, win_count, lose_count, ladder_level) FROM stdin;
\.


--
-- Data for Name: match; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.match (match_id, winner_id, loser_id, played_on, winner_score, loser_score, duration, ladder_level) FROM stdin;
\.


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.player (user_id, nickname, avatar_image, two_factor_auth, friend_list_id, game_profile_id, conversation_ids) FROM stdin;
\.


--
-- Data for Name: single_message; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.single_message (single_message_id, single_message_user_id, single_message_conversation_id, single_message_text, single_message_sent_on) FROM stdin;
\.


--
-- Name: achievement_achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievement_achievement_id_seq', 1, false);


--
-- Name: conversation_conversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conversation_conversation_id_seq', 1, false);


--
-- Name: friend_list_friend_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.friend_list_friend_list_id_seq', 1, false);


--
-- Name: game_profile_game_profile_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_profile_game_profile_id_seq', 1, false);


--
-- Name: match_match_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.match_match_id_seq', 1, false);


--
-- Name: player_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.player_user_id_seq', 1, false);


--
-- Name: single_message_single_message_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.single_message_single_message_id_seq', 1, false);


--
-- Name: achievement achievement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement
    ADD CONSTRAINT achievement_pkey PRIMARY KEY (achievement_id);


--
-- Name: conversation conversation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT conversation_pkey PRIMARY KEY (conversation_id);


--
-- Name: friend_list friend_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend_list
    ADD CONSTRAINT friend_list_pkey PRIMARY KEY (friend_list_id);


--
-- Name: game_profile game_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_profile
    ADD CONSTRAINT game_profile_pkey PRIMARY KEY (game_profile_id);


--
-- Name: match match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (match_id);


--
-- Name: player player_nickname_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_nickname_key UNIQUE (nickname);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (user_id);


--
-- Name: single_message single_message_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.single_message
    ADD CONSTRAINT single_message_pkey PRIMARY KEY (single_message_id);


--
-- Name: achievement_list fk_achievement; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_list
    ADD CONSTRAINT fk_achievement FOREIGN KEY (achievement_id) REFERENCES public.achievement(achievement_id) NOT VALID;


--
-- Name: single_message fk_conversation; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.single_message
    ADD CONSTRAINT fk_conversation FOREIGN KEY (single_message_conversation_id) REFERENCES public.conversation(conversation_id) NOT VALID;


--
-- Name: friend fk_friend; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT fk_friend FOREIGN KEY (friend_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: player fk_friend_list; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT fk_friend_list FOREIGN KEY (friend_list_id) REFERENCES public.friend_list(friend_list_id) NOT VALID;


--
-- Name: friend fk_friend_list_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT fk_friend_list_id FOREIGN KEY (friend_list_id) REFERENCES public.friend_list(friend_list_id) NOT VALID;


--
-- Name: player fk_game_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT fk_game_profile FOREIGN KEY (game_profile_id) REFERENCES public.game_profile(game_profile_id) NOT VALID;


--
-- Name: match fk_loser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT fk_loser FOREIGN KEY (loser_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: single_message fk_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.single_message
    ADD CONSTRAINT fk_sender FOREIGN KEY (single_message_user_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: achievement_list fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievement_list
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: blocked_user_list fk_who_blocked; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_user_list
    ADD CONSTRAINT fk_who_blocked FOREIGN KEY (who_blocked_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: blocked_user_list fk_who_got_blocked; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_user_list
    ADD CONSTRAINT fk_who_got_blocked FOREIGN KEY (who_got_blocked_id) REFERENCES public.player(user_id) NOT VALID;


--
-- Name: match fk_winner; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES public.player(user_id) NOT VALID;


--
-- PostgreSQL database dump complete
--

