--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.4

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
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

INSERT INTO _realtime.tenants VALUES ('d542071c-2131-46b1-b655-cf9cf493d5d9', 'realtime-dev', 'realtime-dev', 'iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==', 200, '2025-06-03 13:14:06', '2025-06-03 13:14:06', 100, 'postgres_cdc_rls', 100000, 100, 100, false, '{"keys": [{"k": "c3VwZXItc2VjcmV0LWp3dC10b2tlbi13aXRoLWF0LWxlYXN0LTMyLWNoYXJhY3RlcnMtbG9uZw", "kty": "oct"}]}', false, false, 0);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

INSERT INTO _realtime.extensions VALUES ('b77fdbb8-2048-4b79-be00-3e2f71e60f00', 'postgres_cdc_rls', '{"region": "us-east-1", "db_host": "RShZ1M8sfz/mHpQV+LlXVvsKQLQ/fT8nrpZkpSm8ymnqzfJl0brU4QLy63dyUzL+", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}', 'realtime-dev', '2025-06-03 13:14:06', '2025-06-03 13:14:06');


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

INSERT INTO _realtime.schema_migrations VALUES (20210706140551, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220329161857, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220410212326, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220506102948, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220527210857, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220815211129, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220815215024, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20220818141501, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20221018173709, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20221102172703, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20221223010058, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20230110180046, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20230810220907, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20230810220924, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20231024094642, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20240306114423, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20240418082835, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20240625211759, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20240704172020, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20240902173232, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20241106103258, '2025-06-02 12:38:08');
INSERT INTO _realtime.schema_migrations VALUES (20250424203323, '2025-06-02 12:38:08');


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.schema_migrations VALUES ('20171026211738');
INSERT INTO auth.schema_migrations VALUES ('20171026211808');
INSERT INTO auth.schema_migrations VALUES ('20171026211834');
INSERT INTO auth.schema_migrations VALUES ('20180103212743');
INSERT INTO auth.schema_migrations VALUES ('20180108183307');
INSERT INTO auth.schema_migrations VALUES ('20180119214651');
INSERT INTO auth.schema_migrations VALUES ('20180125194653');
INSERT INTO auth.schema_migrations VALUES ('00');
INSERT INTO auth.schema_migrations VALUES ('20210710035447');
INSERT INTO auth.schema_migrations VALUES ('20210722035447');
INSERT INTO auth.schema_migrations VALUES ('20210730183235');
INSERT INTO auth.schema_migrations VALUES ('20210909172000');
INSERT INTO auth.schema_migrations VALUES ('20210927181326');
INSERT INTO auth.schema_migrations VALUES ('20211122151130');
INSERT INTO auth.schema_migrations VALUES ('20211124214934');
INSERT INTO auth.schema_migrations VALUES ('20211202183645');
INSERT INTO auth.schema_migrations VALUES ('20220114185221');
INSERT INTO auth.schema_migrations VALUES ('20220114185340');
INSERT INTO auth.schema_migrations VALUES ('20220224000811');
INSERT INTO auth.schema_migrations VALUES ('20220323170000');
INSERT INTO auth.schema_migrations VALUES ('20220429102000');
INSERT INTO auth.schema_migrations VALUES ('20220531120530');
INSERT INTO auth.schema_migrations VALUES ('20220614074223');
INSERT INTO auth.schema_migrations VALUES ('20220811173540');
INSERT INTO auth.schema_migrations VALUES ('20221003041349');
INSERT INTO auth.schema_migrations VALUES ('20221003041400');
INSERT INTO auth.schema_migrations VALUES ('20221011041400');
INSERT INTO auth.schema_migrations VALUES ('20221020193600');
INSERT INTO auth.schema_migrations VALUES ('20221021073300');
INSERT INTO auth.schema_migrations VALUES ('20221021082433');
INSERT INTO auth.schema_migrations VALUES ('20221027105023');
INSERT INTO auth.schema_migrations VALUES ('20221114143122');
INSERT INTO auth.schema_migrations VALUES ('20221114143410');
INSERT INTO auth.schema_migrations VALUES ('20221125140132');
INSERT INTO auth.schema_migrations VALUES ('20221208132122');
INSERT INTO auth.schema_migrations VALUES ('20221215195500');
INSERT INTO auth.schema_migrations VALUES ('20221215195800');
INSERT INTO auth.schema_migrations VALUES ('20221215195900');
INSERT INTO auth.schema_migrations VALUES ('20230116124310');
INSERT INTO auth.schema_migrations VALUES ('20230116124412');
INSERT INTO auth.schema_migrations VALUES ('20230131181311');
INSERT INTO auth.schema_migrations VALUES ('20230322519590');
INSERT INTO auth.schema_migrations VALUES ('20230402418590');
INSERT INTO auth.schema_migrations VALUES ('20230411005111');
INSERT INTO auth.schema_migrations VALUES ('20230508135423');
INSERT INTO auth.schema_migrations VALUES ('20230523124323');
INSERT INTO auth.schema_migrations VALUES ('20230818113222');
INSERT INTO auth.schema_migrations VALUES ('20230914180801');
INSERT INTO auth.schema_migrations VALUES ('20231027141322');
INSERT INTO auth.schema_migrations VALUES ('20231114161723');
INSERT INTO auth.schema_migrations VALUES ('20231117164230');
INSERT INTO auth.schema_migrations VALUES ('20240115144230');
INSERT INTO auth.schema_migrations VALUES ('20240214120130');
INSERT INTO auth.schema_migrations VALUES ('20240306115329');
INSERT INTO auth.schema_migrations VALUES ('20240314092811');
INSERT INTO auth.schema_migrations VALUES ('20240427152123');
INSERT INTO auth.schema_migrations VALUES ('20240612123726');
INSERT INTO auth.schema_migrations VALUES ('20240729123726');
INSERT INTO auth.schema_migrations VALUES ('20240802193726');
INSERT INTO auth.schema_migrations VALUES ('20240806073726');
INSERT INTO auth.schema_migrations VALUES ('20241009103726');


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Patient" VALUES (1, 'M.', 'Muller', 'Steeve', '1980-04-10', 45, 'Marié(e)', 'Opérateur SB', 'A78', 'Quentin Butin', 'High Power', 'Matin', 'CDI', '100', 'HQ', '2024-03-28', '1 ans et 1 mois', '10', '10', 'Voiture', 1, '', '', '', '', '', '', '', '29.04.2025', '2025-04-29 06:23:23.689', '2025-04-30 11:27:31.723');
INSERT INTO public."Patient" VALUES (2, 'M.', 'Tyrol', 'Gaston', '1998-05-16', 26, 'Célibataire', 'Opérateur SB', 'Z-58 Pack', 'Guilhem Nicole', 'FP/Ster/Metallic', 'Soir', 'CDD', '40', 'SMQ', '2024-01-01', '1 ans et 4 mois', '10', '10', 'Voiture', 1, '', '', '', '', '', '', '', '29.04.2025', '2025-04-29 06:33:16.045', '2025-04-30 15:02:20.417');
INSERT INTO public."Patient" VALUES (3, 'Mlle', 'Lopez', 'Maria', '2001-01-25', 24, 'Divorcé(e)', 'Commerciaux', NULL, 'Nicolas Lejeune', 'Engineering Dev', 'Journée', 'CDM', '100', 'SMQ', '2020-03-17', '5 ans et 1 mois', '5', '5', 'Marche', 1, '', '', '', '', '', '', '', '29.04.2025', '2025-04-29 06:33:59.83', '2025-04-30 15:00:55.166');
INSERT INTO public."Patient" VALUES (4, 'Mme', 'Bollet', 'Pauline', '1995-04-02', 30, 'Célibataire', 'Opérateur Log', NULL, 'Joaquim Oliveira S', 'FP/Ster/Metallic', 'Journée', 'Temporaire', '80', 'HQ', '2015-08-14', '9 ans et 8 mois', '30', '45', 'Transport en commun', 1, '', '', '', '', '', '', '', '29.04.2025', '2025-04-29 06:34:07.731', '2025-04-30 14:59:36.525');
INSERT INTO public."Patient" VALUES (5, 'M.', 'Marie', 'Roland', '1902-05-08', 122, 'Marié(e)', 'Agent de sécurité', NULL, 'Myriam Abdelkafi', 'High Power', 'Matin', 'CDI', '100', 'HQ', '', '', '20', '20', 'Transport en commun', 1, '', '', '', '', '', '', '', '2025-05-01', '2025-05-01 07:02:04.754', '2025-05-01 07:02:04.754');
INSERT INTO public."Patient" VALUES (6, 'M.', 'Lefevre', 'Remy', '1987-06-06', 37, 'Célibataire', 'Opérateur SB', 'fff5', 'Myriam Abdelkafi', 'High Power', 'Matin', 'CDI', '100', 'HQ', '2020-04-04', '5 ans et 1 mois', '50', '50', 'Voiture', 1, '', '', '', '', '', '', '', '2025-05-05', '2025-05-05 20:28:07.964', '2025-05-05 20:28:07.964');
INSERT INTO public."Patient" VALUES (7, 'Mme', 'Test supabase', 'supa', '1996-05-01', 29, 'Célibataire', 'Opérateur Log', NULL, 'Myriam Abdelkafi', 'High Power', 'Matin', 'CDI', '100', 'HQ', '2019-05-01', '6 ans et 1 mois', '10', '10', 'Voiture', 1, '', '', '', '', '', '', '', '2025-06-02', '2025-06-02 07:07:52.216', '2025-06-02 07:07:52.216');
INSERT INTO public."Patient" VALUES (8, '', 're tes', 'dddd', '', 0, '', '', NULL, '', '', '', '', '', '', '', '', '', '', '', 1, '', '', '', '', '', '', '', '2025-06-08', '2025-06-08 09:22:06.766', '2025-06-08 09:22:06.766');


--
-- Data for Name: Entretien; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Entretien" VALUES (1, 1, 4, '2025-04-29 20:12:33.105', '2025-04-29 20:13:48.99', 'brouillon', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-29 20:12:33.082', NULL, 0, true, '2025-04-29 20:13:48.988');
INSERT INTO public."Entretien" VALUES (2, 1, 5, '2025-04-29 20:27:57.377', '2025-04-29 20:28:06.455', 'brouillon', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-29 20:27:57.091', NULL, 0, true, '2025-04-29 20:28:06.451');
INSERT INTO public."Entretien" VALUES (3, 1, 7, '2025-04-29 20:32:10.442', '2025-04-29 20:51:23.403', 'archive', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-29 20:32:10.416', '2025-04-29 20:51:23.403', 0, true, '2025-04-29 20:32:22.66');
INSERT INTO public."Entretien" VALUES (4, 1, 8, '2025-04-29 20:32:34.348', '2025-04-30 15:05:13.643', 'finalise', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-29 20:32:34.328', '2025-04-30 15:05:13.643', 0, true, '2025-04-29 20:51:05.561');
INSERT INTO public."Entretien" VALUES (5, 1, 9, '2025-04-29 20:46:57.463', '2025-04-29 20:51:55.625', 'archive', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"ccccccccccccc","commentaires":"5555"},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-29 20:46:57.087', '2025-04-29 20:50:53.384', 20, true, '2025-04-29 20:47:44.311');
INSERT INTO public."Entretien" VALUES (6, 1, 20, '2025-04-30 09:55:29.252', '2025-04-30 15:05:01.278', 'archive', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"dddddd","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-30 09:55:28.914', '2025-04-30 15:05:01.278', 0, true, '2025-04-30 09:55:30.957');
INSERT INTO public."Entretien" VALUES (7, 1, 21, '2025-04-30 10:02:42.087', '2025-05-05 20:31:01.983', 'finalise', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":"","motifs":["Entretien de Suivi Infirmier","Annonce Maternité","A la demande du collaborateur","A la demande du manager/inquiétude santé"]},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"100","tension":"12/16","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":["TMS Dos","Troubles psychologiques"],"risquesProfessionnels":[{"id":11,"nom":"Cancers professionnels","lien":"https://www.inrs.fr/risques/cancers-professionnels.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":7,"nom":"Bien-être au travail","lien":"https://www.inrs.fr/risques/bien-etre-travail.html","estFavori":false,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":4,"nom":"Agressions et violences externes","lien":"https://www.inrs.fr/risques/agressions-violences-externes.html","estFavori":false,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":13,"nom":"Champs électromagnétiques","lien":"https://www.inrs.fr/risques/champs-electromagnetiques.html","estFavori":false,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"}]},"limitation":{"hasLimitation":true,"dureeType":"temporaire","dureeJours":10,"commentaire":""},"actions":{"orientation":{"selected":["Médecin traitant"],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":true,"dateRappel":"2025-05-29","commentaire":"Pour TMS"}}}}', '2025-04-30 10:02:41.762', '2025-05-01 06:25:31.407', 73288, true, '2025-05-01 06:25:30.026');
INSERT INTO public."Entretien" VALUES (8, 2, 1, '2025-04-30 15:02:50.918', '2025-05-05 14:12:03.056', 'brouillon', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"efesgf","commentaires":"ergberg","motifs":["Absence perlée (3 absences de maximum 3 jours/5 mois)","A la demande du collaborateur","A la demande du manager/inquiétude santé"]},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":8,"relationHierarchie":8,"stress":2,"satisfaction":8,"commentaires":""},"plaintesTravail":{"existence":true,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":true,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":true,"quantiteJour":"","depuis":""},"medicaments":{"consommation":true,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":true,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":true,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":true,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"160","poids":"50","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":"19.5"},"appareils":{"yeuxAnnexes":{"bilanOPH":true,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":true,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":true,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":true,"description":"","commentaires":""},"chirurgicaux":{"existence":true,"description":"","commentaires":""},"familiaux":{"existence":true,"pere":"","mere":"","autres":""},"professionnels":{"existence":true,"postes":[{"posteOccupe":"tesss","dateDebut":"2000","dateFin":"2001","entreprise":"Eter"}]}},"traitements":{"medicaments":{"existence":true,"description":"","commentaires":""},"vaccination":{"aJour":true,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"fezf","troublesLiesTravail":["TMS Membres inférieurs"],"risquesProfessionnels":[{"id":43,"nom":"Lombalgie","lien":"https://www.inrs.fr/risques/lombalgies.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":6,"nom":"Amiante","lien":"https://www.inrs.fr/risques/amiante.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":10,"nom":"Bruit","lien":"https://www.inrs.fr/risques/bruit.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"}]},"limitation":{"hasLimitation":true,"dureeType":"temporaire","dureeJours":5,"commentaire":""},"actions":{"orientation":{"selected":["Médecin traitant"],"commentaire":"fff"},"etudePoste":{"aFaire":true,"commentaire":"fff"},"manager":{"entretienNecessaire":true,"managerSelectionne":"","commentaire":"","dateRappel":"2025-05-06"},"entretien":{"aPrevoir":true,"dateRappel":"2025-05-28"},"medecin":{"echangeNecessaire":true,"commentaire":"fffff"},"visiteMedicale":{"aPlanifier":true,"dateRappel":"2025-05-26","commentaire":""}}}}', '2025-04-30 15:02:50.544', '2025-05-05 14:11:05.499', 0, true, NULL);
INSERT INTO public."Entretien" VALUES (9, 3, 1, '2025-04-30 15:03:46.812', '2025-05-01 06:26:37.973', 'archive', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":"","motifs":["Dossier AI","Entretien de Suivi Infirmier"]},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":true,"description":"ff","commentaires":"ff"},"chirurgicaux":{"existence":true,"description":"f","commentaires":"f"},"familiaux":{"existence":true,"pere":"f","mere":"ff","autres":""},"professionnels":{"existence":true,"postes":[{"posteOccupe":"Conducteur","dateDebut":"2000","dateFin":"2010","entreprise":"Perrin,"}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[],"risquesProfessionnels":[{"id":43,"nom":"Lombalgie","lien":"https://www.inrs.fr/risques/lombalgies.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"}]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-04-30 15:03:46.773', NULL, 0, false, NULL);
INSERT INTO public."Entretien" VALUES (10, 4, 1, '2025-04-30 15:34:22.976', '2025-05-01 15:14:58.294', 'finalise', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":"","motifs":["Absence perlée (3 absences de maximum 3 jours/5 mois)"]},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""},"familiaux":{"existence":false,"pere":"","mere":"","autres":""},"professionnels":{"existence":false,"postes":[{"posteOccupe":"","dateDebut":"","dateFin":"","entreprise":""}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[],"risquesProfessionnels":[{"id":53,"nom":"Postures sédentaires","lien":"https://www.inrs.fr/risques/postures-sedentaires.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":43,"nom":"Lombalgie","lien":"https://www.inrs.fr/risques/lombalgies.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"},{"id":19,"nom":"Agents chimiques CMR","lien":"https://www.inrs.fr/risques/cmr-agents-chimiques.html","estFavori":true,"createdAt":"2025-04-30T15:17:11.437Z","updatedAt":"2025-04-30T15:17:11.437Z"}]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":true,"commentaire":""},"manager":{"entretienNecessaire":true,"managerSelectionne":"","commentaire":"","dateRappel":"2025-05-15"},"entretien":{"aPrevoir":true,"dateRappel":"2025-05-15"},"medecin":{"echangeNecessaire":true,"commentaire":""},"visiteMedicale":{"aPlanifier":true,"dateRappel":"2025-05-27","commentaire":""}}}}', '2025-04-30 15:34:22.612', '2025-05-01 15:02:07.047', 0, true, '2025-04-30 15:34:24.999');
INSERT INTO public."Entretien" VALUES (12, 1, 22, '2025-05-12 11:41:36.744', '2025-05-12 11:41:36.744', 'finalise', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":"","motifs":[]},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""},"familiaux":{"existence":false,"pere":"","mere":"","autres":""},"professionnels":{"existence":false,"postes":[{"posteOccupe":"","dateDebut":"","dateFin":"","entreprise":""}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[],"risquesProfessionnels":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-05-12 11:41:36.329', NULL, 0, false, NULL);
INSERT INTO public."Entretien" VALUES (14, 4, 2, '2025-05-16 13:21:57.88', '2025-05-16 13:22:00.531', 'brouillon', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motif":"","commentaires":""},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""},"familiaux":{"existence":false,"pere":"","mere":"","autres":""},"professionnels":{"existence":false,"postes":[{"posteOccupe":"","dateDebut":"","dateFin":"","entreprise":""}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[],"risquesProfessionnels":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":true,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-05-16 13:21:57.864', NULL, 0, true, '2025-05-16 13:22:00.53');
INSERT INTO public."Entretien" VALUES (15, 4, 3, '2025-05-16 20:46:46.172', '2025-06-03 14:35:47.839', 'brouillon', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motifs":["","Absence perlée (3 absences de maximum 3 jours/5 mois)","A la demande du collaborateur"],"commentaires":"kkk"},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":5,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""},"familiaux":{"existence":false,"pere":"","mere":"","autres":""},"professionnels":{"existence":false,"postes":[{"posteOccupe":"","dateDebut":"","dateFin":"","entreprise":""}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"dddd","troublesLiesTravail":[],"risquesProfessionnels":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-05-16 20:46:46.157', NULL, 1532934, true, '2025-06-03 14:35:46.248');
INSERT INTO public."Entretien" VALUES (11, 3, 2, '2025-05-01 06:23:48.881', '2025-06-03 20:43:51.02', 'finalise', false, NULL, '{"santeTravail":{"vecuTravail":{"motifVisite":{"motifs":["","Absence perlée (3 absences de maximum 3 jours/5 mois)"],"commentaires":"test"},"postesOccupes":"","posteDeTravail":{"descriptionTaches":"","risquesProfessionnels":"","installationMateriel":""},"ressentiTravail":{"relationCollegues":5,"relationHierarchie":9,"stress":5,"satisfaction":5,"commentaires":""},"plaintesTravail":{"existence":false,"commentaires":""}},"modeVie":{"loisirs":{"activitePhysique":false,"frequence":"","commentaires":""},"addictions":{"tabac":{"consommation":false,"quantiteJour":"","depuis":""},"medicaments":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"alcool":{"consommation":false,"quantiteSupDix":false,"frequence":""},"cannabis":{"consommation":false,"depuis":"","quantiteInfDix":false,"frequence":""},"droguesDures":{"consommation":false,"depuis":"","frequence":""},"commentairesGeneraux":""}}},"examenClinique":{"biometrie":{"taille":"","poids":"","tension":"","pouls":"","temperature":"","glycemie":"","saturation":"","imc":""},"appareils":{"yeuxAnnexes":{"bilanOPH":false,"commentairesORL":"","commentairesOPH":""},"cardioPulmonaire":{"bilanCardio":false,"commentaires":""},"appareilDigestif":{"commentaires":""},"uroGenital":{"suiviGyneco":false,"commentaires":""},"osteoArticulaire":{"plainteEvoquee":false,"commentairesDouleurs":""},"neuroPsy":{"sommeilBon":false,"commentaires":""},"endocrinoMetabolisme":{"dernierBilan":""}},"antecedents":{"medicaux":{"existence":false,"description":"","commentaires":""},"chirurgicaux":{"existence":false,"description":"","commentaires":""},"familiaux":{"existence":false,"pere":"","mere":"","autres":""},"professionnels":{"existence":false,"postes":[{"posteOccupe":"","dateDebut":"","dateFin":"","entreprise":""}]}},"traitements":{"medicaments":{"existence":false,"description":"","commentaires":""},"vaccination":{"aJour":false,"commentaires":""}}},"imaa":{},"conclusion":{"prevention":{"conseilsDonnes":"","troublesLiesTravail":[],"risquesProfessionnels":[]},"limitation":{"hasLimitation":false,"dureeType":"temporaire","dureeJours":0,"commentaire":""},"actions":{"orientation":{"selected":[],"commentaire":""},"etudePoste":{"aFaire":false,"commentaire":""},"manager":{"entretienNecessaire":false,"managerSelectionne":"","commentaire":"","dateRappel":""},"entretien":{"aPrevoir":false,"dateRappel":""},"medecin":{"echangeNecessaire":false,"commentaire":""},"visiteMedicale":{"aPlanifier":false,"dateRappel":"","commentaire":""}}}}', '2025-05-01 06:23:48.41', NULL, 0, false, NULL);


--
-- Data for Name: CalendarEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."CalendarEvent" VALUES (1, 'sdd', '', '2025-07-07 10:00:00', '2025-07-07 11:00:00', false, NULL, 'Reporté', 5, NULL, NULL, '2025-05-01 15:32:17.749', '2025-05-01 15:32:46.066', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (2, 'rrrr', '', '2025-05-23 10:00:00', '2025-05-23 11:00:00', false, NULL, 'Planifié', 5, NULL, NULL, '2025-05-13 11:06:54.144', '2025-05-13 11:06:54.144', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (3, 'zzzz', '', '2025-05-23 10:00:00', '2025-05-23 11:00:00', false, NULL, 'Planifié', 6, NULL, NULL, '2025-05-13 11:10:07.049', '2025-05-13 11:10:07.049', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (4, 'dddd', '', '2025-05-24 10:00:00', '2025-05-24 11:00:00', false, NULL, 'Planifié', 4, NULL, NULL, '2025-05-13 11:31:47.85', '2025-05-13 11:32:04.075', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (5, 'Consultation - Lefevre Remy', '', '2025-05-17 10:00:00', '2025-05-17 11:00:00', false, NULL, 'Planifié', 6, NULL, NULL, '2025-05-13 11:38:28.015', '2025-05-13 11:38:41.874', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (6, 'Vaccination - Muller Steeve', NULL, '2025-05-09 10:00:00', '2025-05-09 11:00:00', false, NULL, 'Planifié', 1, NULL, NULL, '2025-05-14 14:17:13.314', '2025-05-14 14:17:13.314', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (7, 'Évaluation médicale - Tyrol Gaston', NULL, '2025-05-10 10:00:00', '2025-05-10 11:00:00', false, NULL, 'Planifié', 2, NULL, NULL, '2025-05-16 09:21:28.973', '2025-05-16 09:21:28.973', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (8, 'Évaluation médicale - Bollet Pauline', NULL, '2025-05-16 10:00:00', '2025-05-16 11:00:00', false, NULL, 'Planifié', 4, NULL, NULL, '2025-05-16 12:55:45.6', '2025-05-16 12:55:45.6', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (9, 'Consultation - Muller Steeve', NULL, '2025-05-11 12:00:00', '2025-05-11 13:00:00', false, NULL, 'Planifié', 1, NULL, NULL, '2025-05-16 20:47:12.477', '2025-05-16 20:47:12.477', NULL, NULL, NULL);
INSERT INTO public."CalendarEvent" VALUES (10, 'Visite annuelle - Marie Roland', NULL, '2025-06-11 10:00:00', '2025-06-11 11:00:00', false, 'Entretien Infirmier,Formation,Étude de Poste', 'Planifié', 5, NULL, NULL, '2025-06-03 13:21:01.491', '2025-06-03 13:21:01.491', NULL, NULL, NULL);


--
-- Data for Name: EventType; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."EventType" VALUES (1, 'Entretien Infirmier', '#3b82f6', NULL, true, '2025-05-14 14:17:13.314', '2025-05-14 14:17:13.314');
INSERT INTO public."EventType" VALUES (2, 'Visite Médicale', '#22c55e', NULL, true, '2025-05-14 14:17:13.314', '2025-05-14 14:17:13.314');
INSERT INTO public."EventType" VALUES (3, 'Rappel Médical', '#eab308', NULL, true, '2025-05-14 14:17:13.314', '2025-05-14 14:17:13.314');
INSERT INTO public."EventType" VALUES (4, 'Suivi Post-AT', '#f97316', NULL, true, '2025-05-16 09:21:28.973', '2025-05-16 09:21:28.973');
INSERT INTO public."EventType" VALUES (5, 'Vaccination', '#14b8a6', NULL, true, '2025-05-16 12:55:45.6', '2025-05-16 12:55:45.6');
INSERT INTO public."EventType" VALUES (6, 'Formation', '#ec4899', NULL, true, '2025-05-16 12:55:45.6', '2025-05-16 12:55:45.6');
INSERT INTO public."EventType" VALUES (7, 'Autre', '#71717a', NULL, true, '2025-05-16 12:55:45.6', '2025-05-16 12:55:45.6');
INSERT INTO public."EventType" VALUES (8, 'Étude de Poste', '#a855f7', NULL, true, '2025-06-03 13:21:01.491', '2025-06-03 13:21:01.491');


--
-- Data for Name: FormConfiguration; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."FormConfiguration" VALUES (1, 'patientForm', 'Formulaire Patient', '2025-04-28 20:38:54.178', '2025-04-30 15:17:11.408');


--
-- Data for Name: FormSection; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."FormSection" VALUES (1, 'informations_personnelles', 'Informations Personnelles', 1, 1, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormSection" VALUES (2, 'informations_professionnelles', 'Informations Professionnelles', 2, 1, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');


--
-- Data for Name: ListCategory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ListCategory" VALUES (1, 'horaires', 'Horaires', '2025-04-28 20:38:53.832', '2025-04-28 20:38:53.832');
INSERT INTO public."ListCategory" VALUES (2, 'contrats', 'Contrats', '2025-04-28 20:38:53.853', '2025-04-28 20:38:53.853');
INSERT INTO public."ListCategory" VALUES (3, 'tauxOccupation', 'Taux occupation', '2025-04-28 20:38:53.874', '2025-04-28 20:38:53.874');
INSERT INTO public."ListCategory" VALUES (4, 'postes', 'Postes occupés', '2025-04-28 20:38:53.897', '2025-04-28 20:38:53.897');
INSERT INTO public."ListCategory" VALUES (5, 'raisonArret', 'Raison arrêt', '2025-04-28 20:38:53.919', '2025-04-28 20:38:53.919');
INSERT INTO public."ListCategory" VALUES (6, 'managers', 'Managers', '2025-04-28 20:38:53.94', '2025-04-28 20:38:53.94');
INSERT INTO public."ListCategory" VALUES (7, 'zones', 'Zones', '2025-04-28 20:38:53.961', '2025-04-28 20:38:53.961');
INSERT INTO public."ListCategory" VALUES (8, 'motifVisite', 'Motif de la visite', '2025-04-28 20:38:53.981', '2025-04-28 20:38:53.981');
INSERT INTO public."ListCategory" VALUES (9, 'orientation', 'Orientation', '2025-04-28 20:38:54.004', '2025-04-28 20:38:54.004');
INSERT INTO public."ListCategory" VALUES (10, 'dpt', 'DPT', '2025-04-28 20:38:54.027', '2025-04-28 20:38:54.027');
INSERT INTO public."ListCategory" VALUES (11, 'typeEntretien', 'Type entretien', '2025-04-28 20:38:54.048', '2025-04-28 20:38:54.048');
INSERT INTO public."ListCategory" VALUES (12, 'joursFeries', 'Jours fériés', '2025-04-28 20:38:54.07', '2025-04-28 20:38:54.07');
INSERT INTO public."ListCategory" VALUES (13, 'civilites', 'Civilités', '2025-04-28 20:38:54.092', '2025-04-28 20:38:54.092');
INSERT INTO public."ListCategory" VALUES (14, 'etatsCivils', 'État civil', '2025-04-28 20:38:54.117', '2025-04-28 20:38:54.117');
INSERT INTO public."ListCategory" VALUES (15, 'transport', 'Type de transport', '2025-04-28 20:38:54.138', '2025-04-28 20:38:54.138');
INSERT INTO public."ListCategory" VALUES (16, 'troublesTravail', 'Troubles liés au travail', '2025-04-28 20:38:54.159', '2025-04-28 20:38:54.159');


--
-- Data for Name: FormField; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."FormField" VALUES (1, 1, 'civilites', 'Civilité', 'select', true, 1, 'civilites', NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (2, 1, 'nom', 'Nom', 'text', true, 2, NULL, NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (3, 1, 'prenom', 'Prénom', 'text', true, 3, NULL, NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (4, 1, 'dateNaissance', 'Date de naissance', 'date', true, 4, NULL, NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (5, 1, 'etatCivil', 'État civil', 'select', true, 5, 'etatsCivils', NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (6, 2, 'poste', 'Poste', 'select', true, 1, 'postes', NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');
INSERT INTO public."FormField" VALUES (7, 2, 'manager', 'Manager', 'select', true, 2, 'managers', NULL, NULL, 0, 0, '2025-04-30 15:17:11.408', '2025-04-30 15:17:11.408');


--
-- Data for Name: ListItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."ListItem" VALUES (1, 'Matin', 0, 1, '2025-04-30 15:17:10.756', '2025-04-30 15:17:10.756');
INSERT INTO public."ListItem" VALUES (2, 'Journée', 1, 1, '2025-04-30 15:17:10.756', '2025-04-30 15:17:10.756');
INSERT INTO public."ListItem" VALUES (3, 'Soir', 2, 1, '2025-04-30 15:17:10.756', '2025-04-30 15:17:10.756');
INSERT INTO public."ListItem" VALUES (4, 'Nuit', 3, 1, '2025-04-30 15:17:10.756', '2025-04-30 15:17:10.756');
INSERT INTO public."ListItem" VALUES (5, 'CDI', 0, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (6, 'CDD', 1, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (7, 'CDM', 2, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (8, 'Temporaire', 3, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (9, 'Apprentis', 4, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (10, 'Stagiaire', 5, 2, '2025-04-30 15:17:10.794', '2025-04-30 15:17:10.794');
INSERT INTO public."ListItem" VALUES (11, '100', 0, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (12, '90', 1, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (13, '80', 2, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (14, '70', 3, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (15, '60', 4, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (16, '50', 5, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (17, '40', 6, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (18, '30', 7, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (19, '20', 8, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (20, '10', 9, 3, '2025-04-30 15:17:10.834', '2025-04-30 15:17:10.834');
INSERT INTO public."ListItem" VALUES (21, 'Opérateur SB', 0, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (22, 'Opérateur Log', 1, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (23, 'OP Final pack', 2, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (24, 'OP Tech', 3, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (25, 'TL', 4, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (26, 'GL', 5, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (27, 'Ingénieur', 6, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (28, 'Agent Vebego', 7, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (29, 'Agent de sécurité', 8, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (30, 'Tech Maint support', 9, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (31, 'IT', 10, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (32, 'Commerciaux', 11, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (33, 'Tech Maint Prev', 12, 4, '2025-04-30 15:17:10.877', '2025-04-30 15:17:10.877');
INSERT INTO public."ListItem" VALUES (34, 'Maladie', 0, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (35, 'Accident du Travail', 1, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (36, 'Accident Perso', 2, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (37, 'Accident de trajet', 3, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (38, 'Maternité', 4, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (39, 'Inconnue', 5, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (40, 'Sans solde', 6, 5, '2025-04-30 15:17:10.916', '2025-04-30 15:17:10.916');
INSERT INTO public."ListItem" VALUES (41, 'Myriam Abdelkafi', 0, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (42, 'Quentin Butin', 1, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (43, 'Deme Bytyci', 2, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (44, 'Georges Karami', 3, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (45, 'Delphine O''Mahony', 4, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (46, 'Joaquim Oliveira S', 5, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (47, 'Benjamin Visconti', 6, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (48, 'Christopher', 7, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (49, 'Thomas Porret', 8, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (50, 'Guilhem Nicole', 9, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (51, 'Dominique Piguet', 10, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (52, 'Mylene De Blas', 11, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (53, 'Nicolas Lejeune', 12, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (54, 'Laurent Leuba', 13, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (55, 'Bruno Péant', 14, 6, '2025-04-30 15:17:10.957', '2025-04-30 15:17:10.957');
INSERT INTO public."ListItem" VALUES (56, 'High Power', 0, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (57, 'Low Power', 1, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (58, 'Logistique', 2, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (59, 'FP/Ster/Metallic', 3, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (60, 'Facilities', 4, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (61, 'EHS', 5, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (62, 'Site Engineering', 6, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (63, 'Process Dvp Engineering', 7, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (64, 'Supply Chain', 8, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (65, 'Qualité', 9, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (66, 'Marketing', 10, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (67, 'Engineering Dev', 11, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (68, 'HR', 12, 7, '2025-04-30 15:17:10.993', '2025-04-30 15:17:10.993');
INSERT INTO public."ListItem" VALUES (69, 'Absence perlée (3 absences de maximum 3 jours/5 mois)', 0, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (70, 'A la demande du collaborateur', 1, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (71, 'A la demande du manager/inquiétude santé', 2, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (72, 'Aménagements de poste', 3, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (73, 'Annonce Maternité', 4, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (74, 'Dossier AI', 5, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (75, 'Entretien de Suivi Infirmier', 6, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (76, 'Incapacité de travail > 15 jours', 7, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (77, 'Retour incapacité de travail > à 30 jours', 8, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (78, 'Retour post-accident de travail avec incapacité de travail > à 3 jours', 9, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (79, 'Retour Congé Maternité', 10, 8, '2025-04-30 15:17:11.044', '2025-04-30 15:17:11.044');
INSERT INTO public."ListItem" VALUES (80, 'Médecin traitant', 0, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (81, 'ORL', 1, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (82, 'Cardiologue', 2, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (83, 'Gynécologue', 3, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (84, 'Rhumatologue', 4, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (85, 'Physio', 5, 9, '2025-04-30 15:17:11.082', '2025-04-30 15:17:11.082');
INSERT INTO public."ListItem" VALUES (86, 'HQ', 0, 10, '2025-04-30 15:17:11.12', '2025-04-30 15:17:11.12');
INSERT INTO public."ListItem" VALUES (87, 'SMQ', 1, 10, '2025-04-30 15:17:11.12', '2025-04-30 15:17:11.12');
INSERT INTO public."ListItem" VALUES (88, 'Physique', 0, 11, '2025-04-30 15:17:11.158', '2025-04-30 15:17:11.158');
INSERT INTO public."ListItem" VALUES (89, 'Téléphone', 1, 11, '2025-04-30 15:17:11.158', '2025-04-30 15:17:11.158');
INSERT INTO public."ListItem" VALUES (90, 'Visio', 2, 11, '2025-04-30 15:17:11.158', '2025-04-30 15:17:11.158');
INSERT INTO public."ListItem" VALUES (91, '25/12/2024', 0, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (92, '1/1/2025', 1, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (93, '2/1/2025', 2, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (94, '18/4/2025', 3, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (95, '21/4/2025', 4, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (96, '29/5/2025', 5, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (97, '9/6/2025', 6, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (98, '1/8/2025', 7, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (99, '22/9/2025', 8, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (100, '25/12/2025', 9, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (101, '1/1/2026', 10, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (102, '2/1/2026', 11, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (103, '3/4/2026', 12, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (104, '6/4/2026', 13, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (105, '14/5/2026', 14, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (106, '25/5/2026', 15, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (107, '1/8/2026', 16, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (108, '21/9/2026', 17, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (109, '25/12/2026', 18, 12, '2025-04-30 15:17:11.196', '2025-04-30 15:17:11.196');
INSERT INTO public."ListItem" VALUES (110, 'M.', 0, 13, '2025-04-30 15:17:11.234', '2025-04-30 15:17:11.234');
INSERT INTO public."ListItem" VALUES (111, 'Mme', 1, 13, '2025-04-30 15:17:11.234', '2025-04-30 15:17:11.234');
INSERT INTO public."ListItem" VALUES (112, 'Mlle', 2, 13, '2025-04-30 15:17:11.234', '2025-04-30 15:17:11.234');
INSERT INTO public."ListItem" VALUES (113, 'Célibataire', 0, 14, '2025-04-30 15:17:11.272', '2025-04-30 15:17:11.272');
INSERT INTO public."ListItem" VALUES (114, 'Marié(e)', 1, 14, '2025-04-30 15:17:11.272', '2025-04-30 15:17:11.272');
INSERT INTO public."ListItem" VALUES (115, 'Divorcé(e)', 2, 14, '2025-04-30 15:17:11.272', '2025-04-30 15:17:11.272');
INSERT INTO public."ListItem" VALUES (116, 'Veuf/Veuve', 3, 14, '2025-04-30 15:17:11.272', '2025-04-30 15:17:11.272');
INSERT INTO public."ListItem" VALUES (117, 'Pacsé(e)', 4, 14, '2025-04-30 15:17:11.272', '2025-04-30 15:17:11.272');
INSERT INTO public."ListItem" VALUES (118, 'Voiture', 0, 15, '2025-04-30 15:17:11.309', '2025-04-30 15:17:11.309');
INSERT INTO public."ListItem" VALUES (119, 'Transport en commun', 1, 15, '2025-04-30 15:17:11.309', '2025-04-30 15:17:11.309');
INSERT INTO public."ListItem" VALUES (120, 'Marche', 2, 15, '2025-04-30 15:17:11.309', '2025-04-30 15:17:11.309');
INSERT INTO public."ListItem" VALUES (121, 'Deux roues motorisé', 3, 15, '2025-04-30 15:17:11.309', '2025-04-30 15:17:11.309');
INSERT INTO public."ListItem" VALUES (122, 'TMS Membres supérieurs', 0, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (123, 'TMS Dos', 1, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (124, 'TMS Membres inférieurs', 2, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (125, 'Troubles psychologiques', 3, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (126, 'Troubles du sommeil', 4, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (127, 'Troubles digestifs', 5, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');
INSERT INTO public."ListItem" VALUES (128, 'Troubles cardiovasculaires', 6, 16, '2025-04-30 15:17:11.35', '2025-04-30 15:17:11.35');


--
-- Data for Name: RisqueProfessionnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."RisqueProfessionnel" VALUES (1, 'Risques liés à l''activité physique', 'https://www.inrs.fr/risques/activite-physique.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (2, 'Addictions', 'https://www.inrs.fr/risques/addictions.html', true, '2025-04-30 15:17:11.437', '2025-05-05 20:37:08.095');
INSERT INTO public."RisqueProfessionnel" VALUES (3, 'Agents sensibilisants', 'https://www.inrs.fr/risques/agents-sensibilisants.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (4, 'Agressions et violences externes', 'https://www.inrs.fr/risques/agressions-violences-externes.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (5, 'Qualité de l''air intérieur', 'https://www.inrs.fr/risques/air-interieur.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (6, 'Amiante', 'https://www.inrs.fr/risques/amiante.html', false, '2025-04-30 15:17:11.437', '2025-05-05 20:37:11.027');
INSERT INTO public."RisqueProfessionnel" VALUES (7, 'Bien-être au travail', 'https://www.inrs.fr/risques/bien-etre-travail.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (8, 'Risques biologiques', 'https://www.inrs.fr/risques/biologiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (9, 'Bitume', 'https://www.inrs.fr/risques/bitume.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (10, 'Bruit', 'https://www.inrs.fr/risques/bruit.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (11, 'Cancers professionnels', 'https://www.inrs.fr/risques/cancers-professionnels.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (12, 'Travail à la chaleur', 'https://www.inrs.fr/risques/chaleur.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (13, 'Champs électromagnétiques', 'https://www.inrs.fr/risques/champs-electromagnetiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (14, 'Risques chimiques', 'https://www.inrs.fr/risques/chimiques.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (15, 'Chutes de plain-pied', 'https://www.inrs.fr/risques/chutes-de-plain-pied.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (16, 'Risques liés aux chutes de hauteur', 'https://www.inrs.fr/risques/chutes-hauteur.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (17, 'Ciment', 'https://www.inrs.fr/risques/ciment.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (18, 'Classification et étiquetage des produits chimiques', 'https://www.inrs.fr/risques/classification-etiquetage-produits-chimiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (19, 'Agents chimiques CMR', 'https://www.inrs.fr/risques/cmr-agents-chimiques.html', true, '2025-04-30 15:17:11.437', '2025-05-05 20:37:08.095');
INSERT INTO public."RisqueProfessionnel" VALUES (20, 'Covid-19 et prévention en entreprise', 'https://www.inrs.fr/risques/COVID19-prevention-entreprise.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (21, 'Risques liés aux déplacements', 'https://www.inrs.fr/risques/deplacements.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (22, 'Détection en temps réel des polluants', 'https://www.inrs.fr/risques/detection-temps-reel-polluants.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (23, 'Risques électriques', 'https://www.inrs.fr/risques/electriques.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (24, 'Entreprises extérieures', 'https://www.inrs.fr/risques/entreprises-exterieures.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (25, 'Environnements spécifiques de travail', 'https://www.inrs.fr/risques/environnements-specifiques-de-travail.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (26, 'Epuisement professionnel ou burnout', 'https://www.inrs.fr/risques/epuisement-burnout.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (27, 'Espaces confinés', 'https://www.inrs.fr/risques/espaces-confines.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (28, 'Exosquelettes', 'https://www.inrs.fr/risques/exosquelettes.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (29, 'Explosion sur le lieu de travail', 'https://www.inrs.fr/risques/explosion.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (30, 'Fabrication additive', 'https://www.inrs.fr/risques/fabrication-additive.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (31, 'Fibres autres que l''amiante', 'https://www.inrs.fr/risques/fibres-hors-amiante.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (32, 'Fluides de coupe', 'https://www.inrs.fr/risques/fluides-coupe.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (33, 'Formaldéhyde', 'https://www.inrs.fr/risques/formaldehyde.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (34, 'Travail au froid', 'https://www.inrs.fr/risques/froid.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (35, 'Fumées de soudage', 'https://www.inrs.fr/risques/fumees-soudage.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (36, 'Gaz d''échappement', 'https://www.inrs.fr/risques/gaz-echappement.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (37, 'Harcèlement sexuel et agissements sexistes', 'https://www.inrs.fr/risques/harcelements-sexuel-agissements-sexistes.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (38, 'Harcèlement moral et violence interne', 'https://www.inrs.fr/risques/harcelements-violences-internes.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (39, 'Heurts, glissades et autres perturbations du mouvement', 'https://www.inrs.fr/risques/heurts-glissades-perturbations-mouvement.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (40, 'Incendie et explosion', 'https://www.inrs.fr/risques/incendie-explosion.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (41, 'Incendie sur le lieu de travail', 'https://www.inrs.fr/risques/incendie-lieu-travail.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (42, 'Lean management', 'https://www.inrs.fr/risques/lean-management.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (43, 'Lombalgie', 'https://www.inrs.fr/risques/lombalgies.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (44, 'Organisation de la maintenance', 'https://www.inrs.fr/risques/maintenance.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (45, 'Risque mécanique', 'https://www.inrs.fr/risques/mecaniques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (46, 'Meopa', 'https://www.inrs.fr/risques/meopa.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (47, 'Mesure des expositions aux agents chimiques et biologiques', 'https://www.inrs.fr/risques/mesure-expositions-agents-chimiques-biologiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (48, 'Nanomatériaux', 'https://www.inrs.fr/risques/nanomateriaux.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (49, 'Organisation du travail', 'https://www.inrs.fr/risques/organisation.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (50, 'Perturbateurs endocriniens', 'https://www.inrs.fr/risques/perturbateurs-endocriniens.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (51, 'Plomb', 'https://www.inrs.fr/risques/plomb.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (52, 'Polyexpositions', 'https://www.inrs.fr/risques/polyexpositions.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (53, 'Postures sédentaires', 'https://www.inrs.fr/risques/postures-sedentaires.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (54, 'Poussières', 'https://www.inrs.fr/risques/poussieres.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (55, 'Poussières de bois', 'https://www.inrs.fr/risques/poussieres-bois.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (56, 'Risques psychosociaux (RPS)', 'https://www.inrs.fr/risques/psychosociaux.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (57, 'Radon en milieu de travail', 'https://www.inrs.fr/risques/radon.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (58, 'Rayonnements ionisants', 'https://www.inrs.fr/risques/rayonnements-ionisants.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (59, 'Rayonnements optiques', 'https://www.inrs.fr/risques/rayonnements-optiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (60, 'Reproduction', 'https://www.inrs.fr/risques/reproduction.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (61, 'Robots collaboratifs', 'https://www.inrs.fr/risques/robots-collaboratifs.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (62, 'Risques routiers', 'https://www.inrs.fr/risques/routiers.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (63, 'Silice cristalline', 'https://www.inrs.fr/risques/silice-cristalline.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (64, 'Solvants', 'https://www.inrs.fr/risques/solvants.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (65, 'Stress au travail', 'https://www.inrs.fr/risques/stress.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (66, 'Suicide', 'https://www.inrs.fr/risques/suicide-travail.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (67, 'Télétravail', 'https://www.inrs.fr/risques/teletravail.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (68, 'Troubles musculosquelettiques (TMS)', 'https://www.inrs.fr/risques/tms-troubles-musculosquelettiques.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (69, 'Travail sur écran', 'https://www.inrs.fr/risques/travail-ecran.html', true, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (70, 'Travail en horaires atypiques', 'https://www.inrs.fr/risques/travail-horaires-atypiques.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (71, 'Travail isolé', 'https://www.inrs.fr/risques/travail-isole.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (72, 'Vibrations transmises à l''ensemble du corps', 'https://www.inrs.fr/risques/vibration-corps-entier.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (73, 'Vibrations transmises aux membres supérieurs', 'https://www.inrs.fr/risques/vibration-membres-superieurs.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (74, 'Vibrations', 'https://www.inrs.fr/risques/vibrations.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');
INSERT INTO public."RisqueProfessionnel" VALUES (75, 'Zoonoses', 'https://www.inrs.fr/risques/zoonoses.html', false, '2025-04-30 15:17:11.437', '2025-04-30 15:17:11.437');


--
-- Data for Name: _EventTypeToCalendarEvent; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."_EventTypeToCalendarEvent" VALUES (10, 1);
INSERT INTO public."_EventTypeToCalendarEvent" VALUES (10, 6);
INSERT INTO public."_EventTypeToCalendarEvent" VALUES (10, 8);


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.schema_migrations VALUES (20211116024918, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116045059, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116050929, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116051442, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116212300, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116213355, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116213934, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211116214523, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211122062447, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211124070109, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211202204204, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211202204605, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211210212804, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20211228014915, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220107221237, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220228202821, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220312004840, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220603231003, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220603232444, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220615214548, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220712093339, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220908172859, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20220916233421, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230119133233, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230128025114, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230128025212, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230227211149, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230228184745, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230308225145, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20230328144023, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20231018144023, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20231204144023, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20231204144024, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20231204144025, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240108234812, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240109165339, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240227174441, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240311171622, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240321100241, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240401105812, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240418121054, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240523004032, '2025-06-02 12:38:11');
INSERT INTO realtime.schema_migrations VALUES (20240618124746, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20240801235015, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20240805133720, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20240827160934, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20240919163303, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20240919163305, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241019105805, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241030150047, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241108114728, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241121104152, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241130184212, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241220035512, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241220123912, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20241224161212, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20250107150512, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20250110162412, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20250123174212, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20250128220012, '2025-06-02 12:38:12');
INSERT INTO realtime.schema_migrations VALUES (20250506224012, '2025-06-02 12:38:12');


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.migrations VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2025-06-02 12:38:17.975237');
INSERT INTO storage.migrations VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2025-06-02 12:38:18.011319');
INSERT INTO storage.migrations VALUES (2, 'storage-schema', '5c7968fd083fcea04050c1b7f6253c9771b99011', '2025-06-02 12:38:18.015829');
INSERT INTO storage.migrations VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2025-06-02 12:38:18.029766');
INSERT INTO storage.migrations VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2025-06-02 12:38:18.056463');
INSERT INTO storage.migrations VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2025-06-02 12:38:18.062248');
INSERT INTO storage.migrations VALUES (6, 'change-column-name-in-get-size', 'f93f62afdf6613ee5e7e815b30d02dc990201044', '2025-06-02 12:38:18.067489');
INSERT INTO storage.migrations VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2025-06-02 12:38:18.072755');
INSERT INTO storage.migrations VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2025-06-02 12:38:18.077079');
INSERT INTO storage.migrations VALUES (9, 'fix-search-function', '3a0af29f42e35a4d101c259ed955b67e1bee6825', '2025-06-02 12:38:18.081151');
INSERT INTO storage.migrations VALUES (10, 'search-files-search-function', '68dc14822daad0ffac3746a502234f486182ef6e', '2025-06-02 12:38:18.086671');
INSERT INTO storage.migrations VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2025-06-02 12:38:18.093881');
INSERT INTO storage.migrations VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2025-06-02 12:38:18.100029');
INSERT INTO storage.migrations VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2025-06-02 12:38:18.10366');
INSERT INTO storage.migrations VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2025-06-02 12:38:18.107956');
INSERT INTO storage.migrations VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2025-06-02 12:38:18.138592');
INSERT INTO storage.migrations VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2025-06-02 12:38:18.143616');
INSERT INTO storage.migrations VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2025-06-02 12:38:18.147339');
INSERT INTO storage.migrations VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2025-06-02 12:38:18.156382');
INSERT INTO storage.migrations VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2025-06-02 12:38:18.160898');
INSERT INTO storage.migrations VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2025-06-02 12:38:18.164472');
INSERT INTO storage.migrations VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2025-06-02 12:38:18.17328');
INSERT INTO storage.migrations VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2025-06-02 12:38:18.200955');
INSERT INTO storage.migrations VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2025-06-02 12:38:18.225983');
INSERT INTO storage.migrations VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2025-06-02 12:38:18.232205');
INSERT INTO storage.migrations VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2025-06-02 12:38:18.238013');
INSERT INTO storage.migrations VALUES (26, 'objects-prefixes', 'ef3f7871121cdc47a65308e6702519e853422ae2', '2025-06-02 12:38:18.241981');
INSERT INTO storage.migrations VALUES (27, 'search-v2', '33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2', '2025-06-02 12:38:18.267756');
INSERT INTO storage.migrations VALUES (28, 'object-bucket-name-sorting', 'ba85ec41b62c6a30a3f136788227ee47f311c436', '2025-06-02 12:38:18.28394');
INSERT INTO storage.migrations VALUES (29, 'create-prefixes', 'a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b', '2025-06-02 12:38:18.288508');
INSERT INTO storage.migrations VALUES (30, 'update-object-levels', '6c6f6cc9430d570f26284a24cf7b210599032db7', '2025-06-02 12:38:18.292609');
INSERT INTO storage.migrations VALUES (31, 'objects-level-index', '33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8', '2025-06-02 12:38:18.304671');
INSERT INTO storage.migrations VALUES (32, 'backward-compatible-index-on-objects', '2d51eeb437a96868b36fcdfb1ddefdf13bef1647', '2025-06-02 12:38:18.318146');
INSERT INTO storage.migrations VALUES (33, 'backward-compatible-index-on-prefixes', 'fe473390e1b8c407434c0e470655945b110507bf', '2025-06-02 12:38:18.329625');
INSERT INTO storage.migrations VALUES (34, 'optimize-search-function-v1', '82b0e469a00e8ebce495e29bfa70a0797f7ebd2c', '2025-06-02 12:38:18.331505');
INSERT INTO storage.migrations VALUES (35, 'add-insert-trigger-prefixes', '63bb9fd05deb3dc5e9fa66c83e82b152f0caf589', '2025-06-02 12:38:18.34277');
INSERT INTO storage.migrations VALUES (36, 'optimise-existing-functions', '81cf92eb0c36612865a18016a38496c530443899', '2025-06-02 12:38:18.346444');
INSERT INTO storage.migrations VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2025-06-02 12:38:18.355764');


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

INSERT INTO supabase_functions.migrations VALUES ('initial', '2025-06-02 12:38:00.676569+00');
INSERT INTO supabase_functions.migrations VALUES ('20210809183423_update_grants', '2025-06-02 12:38:00.676569+00');


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

INSERT INTO supabase_migrations.schema_migrations VALUES ('001', '{"-- supabase/migrations/001_initial_schema.sql



-- Enable UUID extension

CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"","-- Table des catégories de listes

CREATE TABLE list_categories (

    id SERIAL PRIMARY KEY,

    list_id TEXT UNIQUE NOT NULL,

    name TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","-- Table des éléments de liste

CREATE TABLE list_items (

    id SERIAL PRIMARY KEY,

    value TEXT NOT NULL,

    \"order\" INTEGER NOT NULL,

    category_id INTEGER NOT NULL REFERENCES list_categories(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    UNIQUE(category_id, value)

)","CREATE INDEX idx_list_items_category_order ON list_items(category_id, \"order\")","-- Table des patients

CREATE TABLE patients (

    id SERIAL PRIMARY KEY,

    civilites TEXT NOT NULL,

    nom TEXT NOT NULL,

    prenom TEXT NOT NULL,

    date_naissance TEXT NOT NULL,

    age INTEGER NOT NULL,

    etat_civil TEXT NOT NULL,

    poste TEXT NOT NULL,

    numero_ligne TEXT,

    manager TEXT NOT NULL,

    zone TEXT NOT NULL,

    horaire TEXT,

    contrat TEXT NOT NULL,

    taux_activite TEXT NOT NULL,

    departement TEXT NOT NULL,

    date_entree TEXT NOT NULL,

    anciennete TEXT NOT NULL,

    temps_trajet_aller TEXT NOT NULL,

    temps_trajet_retour TEXT NOT NULL,

    type_transport TEXT NOT NULL,

    numero_entretien INTEGER,

    nom_entretien TEXT,

    date_entretien TEXT,

    heure_debut TEXT,

    heure_fin TEXT,

    duree TEXT,

    type_entretien TEXT,

    consentement TEXT,

    date_creation TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","-- Table des configurations de formulaire

CREATE TABLE form_configurations (

    id SERIAL PRIMARY KEY,

    page_id TEXT UNIQUE NOT NULL,

    name TEXT NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","CREATE INDEX idx_form_configurations_page_id ON form_configurations(page_id)","-- Table des sections de formulaire

CREATE TABLE form_sections (

    id SERIAL PRIMARY KEY,

    name TEXT NOT NULL,

    label TEXT NOT NULL,

    \"order\" INTEGER NOT NULL,

    form_id INTEGER NOT NULL REFERENCES form_configurations(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    UNIQUE(form_id, name)

)","CREATE INDEX idx_form_sections_form_order ON form_sections(form_id, \"order\")","-- Table des champs de formulaire

CREATE TABLE form_fields (

    id SERIAL PRIMARY KEY,

    section_id INTEGER NOT NULL REFERENCES form_sections(id) ON DELETE CASCADE,

    name TEXT NOT NULL,

    label TEXT NOT NULL,

    type TEXT NOT NULL,

    required BOOLEAN DEFAULT false,

    \"order\" INTEGER NOT NULL,

    list_id TEXT REFERENCES list_categories(list_id),

    default_value TEXT,

    validation TEXT,

    position_x INTEGER DEFAULT 0,

    position_y INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    UNIQUE(section_id, name)

)","CREATE INDEX idx_form_fields_section_order ON form_fields(section_id, \"order\")","CREATE INDEX idx_form_fields_list_id ON form_fields(list_id)","-- Table des entretiens

CREATE TABLE entretiens (

    id SERIAL PRIMARY KEY,

    patient_id INTEGER NOT NULL REFERENCES patients(id),

    numero_entretien INTEGER NOT NULL,

    date_creation TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    status TEXT DEFAULT ''brouillon'',

    is_template BOOLEAN DEFAULT false,

    base_entretien_id INTEGER,

    donnees_entretien TEXT,

    temps_debut TIMESTAMP WITH TIME ZONE,

    temps_fin TIMESTAMP WITH TIME ZONE,

    temps_pause INTEGER,

    en_pause BOOLEAN DEFAULT false,

    derniere_pause TIMESTAMP WITH TIME ZONE

)","-- Table des types d''événements

CREATE TABLE event_types (

    id SERIAL PRIMARY KEY,

    name TEXT UNIQUE NOT NULL,

    color TEXT DEFAULT ''#3b82f6'',

    icon TEXT,

    active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","-- Table des risques professionnels

CREATE TABLE risques_professionnels (

    id SERIAL PRIMARY KEY,

    nom TEXT NOT NULL,

    lien TEXT NOT NULL,

    est_favori BOOLEAN DEFAULT false,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","-- Table des événements du calendrier

CREATE TABLE calendar_events (

    id SERIAL PRIMARY KEY,

    title TEXT NOT NULL,

    description TEXT,

    start_date TIMESTAMP WITH TIME ZONE NOT NULL,

    end_date TIMESTAMP WITH TIME ZONE NOT NULL,

    all_day BOOLEAN DEFAULT false,

    event_type_string TEXT,

    status TEXT DEFAULT ''planifie'',

    patient_id INTEGER REFERENCES patients(id),

    entretien_id INTEGER REFERENCES entretiens(id) ON DELETE SET NULL,

    metadata TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    created_by TEXT,

    recurrence TEXT,

    parent_event_id INTEGER

)","CREATE INDEX idx_calendar_events_patient_id ON calendar_events(patient_id)","CREATE INDEX idx_calendar_events_entretien_id ON calendar_events(entretien_id)","CREATE INDEX idx_calendar_events_dates ON calendar_events(start_date, end_date)","-- Table de liaison many-to-many entre événements et types d''événements

CREATE TABLE event_type_calendar_event (

    event_type_id INTEGER NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,

    calendar_event_id INTEGER NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,

    PRIMARY KEY (event_type_id, calendar_event_id)

)","-- Table des profils utilisateurs (pour l''authentification Supabase)

CREATE TABLE profiles (

    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,

    email TEXT UNIQUE NOT NULL,

    name TEXT,

    role TEXT CHECK (role IN (''ADMIN'', ''INFIRMIER'', ''INFIRMIER_CHEF'', ''MEDECIN'')) DEFAULT ''INFIRMIER'',

    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL,

    date_modification TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL

)","-- RLS (Row Level Security) pour les profils

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY","-- Politique pour que les utilisateurs puissent voir leur propre profil

CREATE POLICY \"Users can view own profile\" ON profiles

    FOR SELECT USING (auth.uid() = id)","-- Politique pour que les admins puissent tout voir

CREATE POLICY \"Admins can view all profiles\" ON profiles

    FOR SELECT USING (

        EXISTS (

            SELECT 1 FROM profiles 

            WHERE id = auth.uid() AND role = ''ADMIN''

        )

    )","-- Fonction pour créer automatiquement un profil lors de l''inscription

CREATE OR REPLACE FUNCTION public.handle_new_user() 

RETURNS trigger AS $$

BEGIN

    INSERT INTO public.profiles (id, email, name)

    VALUES (new.id, new.email, new.raw_user_meta_data->>''name'');

    RETURN new;

END;

$$ LANGUAGE plpgsql SECURITY DEFINER","-- Trigger pour exécuter la fonction

CREATE TRIGGER on_auth_user_created

    AFTER INSERT ON auth.users

    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user()","-- Fonction pour mettre à jour date_modification automatiquement

CREATE OR REPLACE FUNCTION public.handle_date_modification()

RETURNS trigger AS $$

BEGIN

    NEW.date_modification = timezone(''utc''::text, now());

    RETURN NEW;

END;

$$ LANGUAGE plpgsql","-- Triggers pour date_modification sur toutes les tables

CREATE TRIGGER handle_date_modification BEFORE UPDATE ON list_categories

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON list_items

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON patients

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_configurations

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_sections

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON form_fields

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON entretiens

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON event_types

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON risques_professionnels

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON calendar_events

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()","CREATE TRIGGER handle_date_modification BEFORE UPDATE ON profiles

    FOR EACH ROW EXECUTE PROCEDURE public.handle_date_modification()"}', 'initial_schema');


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: CalendarEvent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CalendarEvent_id_seq"', 10, true);


--
-- Name: Entretien_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Entretien_id_seq"', 15, true);


--
-- Name: EventType_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."EventType_id_seq"', 8, true);


--
-- Name: FormConfiguration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormConfiguration_id_seq"', 1, true);


--
-- Name: FormField_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormField_id_seq"', 7, true);


--
-- Name: FormSection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormSection_id_seq"', 2, true);


--
-- Name: ListCategory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ListCategory_id_seq"', 16, true);


--
-- Name: ListItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ListItem_id_seq"', 128, true);


--
-- Name: Patient_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Patient_id_seq"', 8, true);


--
-- Name: RisqueProfessionnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."RisqueProfessionnel_id_seq"', 75, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

