/*
 * VIZJA University — Agent Due Diligence
 * Shared bilingual (EN/PL) schema. Loaded both in the browser (window.VIZJA_SCHEMA)
 * and in Node (require) so the form renderer and the admin viewer stay in sync.
 *
 * Field types:
 *   text         - single line input
 *   textarea     - multi line input
 *   yesno        - radio group; options default Yes/No, override with .options
 *   checkboxes   - multiple choice; .options[] (+ optional .other for free text)
 *   table        - addable rows; .columns[] {id,label,type}
 *   feeTable     - fixed-row fee table (section 9.2)
 *   rowsYesNo        - matrix, each row Yes/No
 *   rowsYesNoExplain - matrix, each row Yes/No + explanation text
 *   rowsCheck        - matrix, each row a single checkbox (+ optional other)
 *   rowsConfirm      - matrix, each row a single "Confirmed" checkbox
 *   confirm      - single Confirmed / Not confirmed
 *   info         - static descriptive paragraph (no input)
 */
(function (global) {
  // shorthand
  const t = (en, pl) => ({ en, pl });

  const YESNO = [t('Yes', 'Tak'), t('No', 'Nie')];

  const formSchema = {
    title: t('Agent Due Diligence Form', 'Formularz Due Diligence Agenta'),
    subtitle: t('International Student Recruitment',
                'Rekrutacja Studentów Zagranicznych'),
    university: 'VIZJA University',
    intro: {
      heading: t('Purpose of this form', 'Cel formularza'),
      body: [
        t('This form is used by VIZJA University to assess prospective and current international student recruitment partners. The purpose is to ensure that cooperation with education agents is transparent, lawful, ethical and aligned with VIZJA University’s admission, compliance and student protection standards.',
          'Formularz jest wykorzystywany przez VIZJA University do oceny obecnych i potencjalnych partnerów w zakresie rekrutacji studentów zagranicznych. Jego celem jest zapewnienie, że współpraca z agentami edukacyjnymi jest przejrzysta, zgodna z prawem, etyczna oraz zgodna ze standardami rekrutacji, zgodności i ochrony studentów obowiązującymi w VIZJA University.'),
        t('Completion of this form does not automatically create any right to represent VIZJA University. Cooperation may begin only after formal approval and signing of a written agreement with VIZJA University.',
          'Wypełnienie formularza nie tworzy automatycznie żadnego prawa do reprezentowania VIZJA University. Współpraca może rozpocząć się dopiero po formalnym zatwierdzeniu i podpisaniu pisemnej umowy z VIZJA University.')
      ]
    },
    sections: [
      {
        id: '1', title: t('Agency Identification', 'Identyfikacja Agencji'),
        fields: [
          { id: '1.1', type: 'text', label: t('Full legal name of the agency', 'Pełna nazwa prawna agencji') },
          { id: '1.2', type: 'text', label: t('Trading name / brand name, if different', 'Nazwa handlowa / marka, jeśli inna') },
          { id: '1.3', type: 'text', label: t('Country of registration', 'Kraj rejestracji') },
          { id: '1.4', type: 'text', label: t('Registration number / company identification number', 'Numer rejestracyjny / numer identyfikacyjny firmy') },
          { id: '1.5', type: 'text', label: t('Registered address', 'Adres rejestrowy') },
          { id: '1.6', type: 'text', label: t('Operational address, if different', 'Adres operacyjny, jeśli inny') },
          { id: '1.7', type: 'text', label: t('Official website', 'Oficjalna strona internetowa') },
          { id: '1.8', type: 'text', label: t('Official email address', 'Oficjalny adres e-mail') },
          { id: '1.9', type: 'text', label: t('Official phone number', 'Oficjalny numer telefonu') },
          { id: '1.10', type: 'textarea', label: t('Official social media profiles used for student recruitment', 'Oficjalne profile w mediach społecznościowych wykorzystywane do rekrutacji studentów') },
          { id: '1.11', type: 'text', label: t('Name and position of the person authorised to represent the agency', 'Imię, nazwisko i stanowisko osoby upoważnionej do reprezentowania agencji') },
          { id: '1.12', type: 'text', label: t('Main contact person for cooperation with VIZJA University', 'Główna osoba kontaktowa do współpracy z VIZJA University') },
          { id: '1.13', type: 'text', label: t('Contact email and phone number', 'E-mail i numer telefonu kontaktowego') }
        ]
      },
      {
        id: '2', title: t('Legal Status and Authorisation', 'Status Prawny i Uprawnienia'),
        fields: [
          { id: '2.1', type: 'yesno', label: t('Is your agency legally registered in the country where it operates?', 'Czy agencja jest legalnie zarejestrowana w kraju, w którym działa?') },
          { id: '2.1a', type: 'text', label: t('If yes, please attach a company registration document or provide a public registry link', 'Jeśli tak, prosimy załączyć dokument rejestrowy firmy lub podać link do publicznego rejestru') },
          { id: '2.2', type: 'yesno', label: t('Is your agency legally allowed to provide student recruitment or education consulting services in the country/countries where it operates?', 'Czy agencja jest prawnie uprawniona do świadczenia usług rekrutacji studentów lub doradztwa edukacyjnego w kraju/krajach, w których działa?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('Not applicable / no specific licence required', 'Nie dotyczy / brak wymaganej szczególnej licencji')] },
          { id: '2.2a', type: 'textarea', label: t('Please explain', 'Prosimy o wyjaśnienie') },
          { id: '2.3', type: 'yesno', label: t('Does your agency require any specific licence, permit or authorisation to provide student recruitment, education consulting, migration consulting or visa-related advisory services?', 'Czy agencja wymaga szczególnej licencji, zezwolenia lub upoważnienia do świadczenia usług rekrutacji studentów, doradztwa edukacyjnego, doradztwa migracyjnego lub doradztwa wizowego?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('Not applicable', 'Nie dotyczy')] },
          { id: '2.3a', type: 'textarea', label: t('If yes, please provide details', 'Jeśli tak, prosimy o szczegóły') },
          { id: '2.4', type: 'rowsYesNoExplain',
            label: t('Has your agency, its owners, directors or key staff ever been subject to any of the following?', 'Czy agencja, jej właściciele, dyrektorzy lub kluczowi pracownicy byli kiedykolwiek przedmiotem któregokolwiek z poniższych?'),
            rows: [
              t('Criminal proceedings related to fraud, forgery, corruption or migration abuse', 'Postępowanie karne związane z oszustwem, fałszerstwem, korupcją lub nadużyciami migracyjnymi'),
              t('Administrative sanctions related to education consulting, recruitment or visa support', 'Sankcje administracyjne związane z doradztwem edukacyjnym, rekrutacją lub wsparciem wizowym'),
              t('Termination of cooperation by an educational institution due to misconduct', 'Rozwiązanie współpracy przez instytucję edukacyjną z powodu naruszeń'),
              t('Serious complaints from candidates concerning misleading information or hidden fees', 'Poważne skargi kandydatów dotyczące wprowadzających w błąd informacji lub ukrytych opłat'),
              t('Legal disputes with candidates, parents, institutions or public authorities', 'Spory prawne z kandydatami, rodzicami, instytucjami lub organami publicznymi')
            ] }
        ]
      },
      {
        id: '3', title: t('Ownership and Management', 'Struktura Własności i Zarządzania'),
        fields: [
          { id: '3.1', type: 'table',
            label: t('Please provide basic information about the ownership or control structure of the agency.', 'Prosimy o podstawowe informacje o strukturze własności lub kontroli agencji.'),
            columns: [
              { id: 'name', label: t('Name / entity', 'Nazwa / podmiot') },
              { id: 'role', label: t('Role (owner / shareholder / beneficial owner / director)', 'Rola (właściciel / udziałowiec / beneficjent rzeczywisty / dyrektor)') },
              { id: 'country', label: t('Country', 'Kraj') }
            ] },
          { id: '3.2', type: 'table',
            label: t('Please provide details of the senior management team.', 'Prosimy o dane kadry zarządzającej wyższego szczebla.'),
            columns: [
              { id: 'name', label: t('Name', 'Imię i nazwisko') },
              { id: 'position', label: t('Position', 'Stanowisko') },
              { id: 'area', label: t('Area of responsibility', 'Obszar odpowiedzialności') }
            ] },
          { id: '3.3', type: 'yesno', label: t('Is the agency, its owners or managers connected with any public official, embassy employee, consular officer, visa centre employee or VIZJA University employee?', 'Czy agencja, jej właściciele lub kierownicy są powiązani z jakimkolwiek urzędnikiem publicznym, pracownikiem ambasady, urzędnikiem konsularnym, pracownikiem centrum wizowego lub pracownikiem VIZJA University?') },
          { id: '3.3a', type: 'textarea', label: t('If yes, please explain', 'Jeśli tak, prosimy o wyjaśnienie') }
        ]
      },
      {
        id: '4', title: t('Recruitment Experience', 'Doświadczenie w Rekrutacji'),
        fields: [
          { id: '4.1', type: 'text', label: t('How many years has your agency been active in international student recruitment or education consulting?', 'Od ilu lat agencja działa w zakresie rekrutacji studentów zagranicznych lub doradztwa edukacyjnego?') },
          { id: '4.2', type: 'textarea', label: t('From which countries do you usually recruit candidates?', 'Z jakich krajów zazwyczaj rekrutujecie kandydatów?') },
          { id: '4.3', type: 'textarea', label: t('Which destination countries do you usually promote?', 'Jakie kraje docelowe zazwyczaj promujecie?') },
          { id: '4.4', type: 'checkboxes', label: t('What types of programmes do you usually recruit for?', 'Na jakie typy programów zazwyczaj rekrutujecie?'),
            options: [
              t('Bachelor’s degree programmes', 'Studia licencjackie'),
              t('Master’s degree programmes', 'Studia magisterskie'),
              t('Long-cycle master’s degree programmes', 'Jednolite studia magisterskie'),
              t('Foundation / pathway programmes', 'Programy przygotowawcze / pathway'),
              t('Language courses', 'Kursy językowe')
            ], other: true },
          { id: '4.5', type: 'textarea', label: t('Without naming partner institutions, please describe your general experience in international student recruitment (type of institutions, destination countries, main fields of study, number of years of experience).', 'Bez wymieniania instytucji partnerskich prosimy opisać ogólne doświadczenie w rekrutacji studentów zagranicznych (rodzaj instytucji, kraje docelowe, główne kierunki studiów, liczba lat doświadczenia).') },
          { id: '4.6', type: 'table', fixedRows: true,
            label: t('Please provide approximate aggregate recruitment results from the last completed recruitment year, if available.', 'Prosimy podać przybliżone zbiorcze wyniki rekrutacji z ostatniego zakończonego roku rekrutacyjnego, jeśli są dostępne.'),
            columns: [
              { id: 'indicator', label: t('Indicator', 'Wskaźnik'), readonly: true },
              { id: 'number', label: t('Approximate number', 'Liczba przybliżona') }
            ],
            rows: [
              t('Candidates advised', 'Kandydaci, którym udzielono porad'),
              t('Applications submitted to foreign institutions', 'Wnioski złożone do instytucji zagranicznych'),
              t('Candidates admitted', 'Kandydaci przyjęci'),
              t('Candidates who obtained visas', 'Kandydaci, którzy uzyskali wizy'),
              t('Candidates who actually enrolled', 'Kandydaci, którzy faktycznie podjęli studia')
            ] }
        ]
      },
      {
        id: '5', title: t('Recruitment Model', 'Model Rekrutacji'),
        fields: [
          { id: '5.1', type: 'checkboxes', label: t('How does your agency usually attract candidates?', 'W jaki sposób agencja zazwyczaj pozyskuje kandydatów?'),
            options: [
              t('Online advertising', 'Reklama internetowa'),
              t('Social media', 'Media społecznościowe'),
              t('Education fairs', 'Targi edukacyjne'),
              t('School visits', 'Wizyty w szkołach'),
              t('Referrals', 'Polecenia'),
              t('Local offices', 'Biura lokalne'),
              t('Partner organisations', 'Organizacje partnerskie'),
              t('Sub-agents / external recruiters', 'Subagenci / zewnętrzni rekruterzy')
            ], other: true },
          { id: '5.2', type: 'textarea', label: t('Please describe your standard process from first contact with a candidate to submission of the application to the university.', 'Prosimy opisać standardowy proces od pierwszego kontaktu z kandydatem do złożenia wniosku na uczelnię.') },
          { id: '5.3', type: 'yesno', label: t('Does your agency conduct an initial assessment of candidates before recommending them to a university?', 'Czy agencja przeprowadza wstępną ocenę kandydatów przed zarekomendowaniem ich uczelni?') },
          { id: '5.3a', type: 'rowsCheck', label: t('If yes, what do you check?', 'Jeśli tak, co sprawdzacie?'),
            rows: [
              t('Identity', 'Tożsamość'),
              t('Educational background', 'Wykształcenie'),
              t('Completeness of documents', 'Kompletność dokumentów'),
              t('Language proficiency', 'Znajomość języka'),
              t('Financial readiness', 'Gotowość finansowa'),
              t('Genuine intention to study', 'Rzeczywisty zamiar podjęcia studiów'),
              t('Understanding of programme and tuition fees', 'Zrozumienie programu i opłat za studia'),
              t('Previous visa refusals', 'Wcześniejsze odmowy wizowe'),
              t('Previous study history', 'Wcześniejsza historia studiów')
            ], other: true },
          { id: '5.4', type: 'yesno', label: t('Does your agency interview or speak directly with candidates before submitting their application?', 'Czy agencja przeprowadza rozmowy lub rozmawia bezpośrednio z kandydatami przed złożeniem ich wniosku?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('In selected cases only', 'Tylko w wybranych przypadkach')] },
          { id: '5.4a', type: 'textarea', label: t('Please explain', 'Prosimy o wyjaśnienie') }
        ]
      },
      {
        id: '6', title: t('Use of Sub-Agents or External Recruiters', 'Korzystanie z Subagentów lub Zewnętrznych Rekruterów'),
        intro: t('VIZJA University understands that some agencies may use sub-agents, local representatives or external recruiters and that their names may be commercially sensitive. Therefore, this section does not require disclosure of names at the due diligence stage.',
                 'VIZJA University rozumie, że niektóre agencje mogą korzystać z subagentów, lokalnych przedstawicieli lub zewnętrznych rekruterów oraz że ich nazwy mogą być poufne handlowo. Dlatego ta sekcja nie wymaga ujawniania nazw na etapie due diligence.'),
        fields: [
          { id: '6.1', type: 'yesno', label: t('Does your agency use sub-agents, freelancers, local representatives, referral partners or third-party recruiters?', 'Czy agencja korzysta z subagentów, freelancerów, lokalnych przedstawicieli, partnerów polecających lub rekruterów zewnętrznych?') },
          { id: '6.2', type: 'checkboxes', label: t('If yes, please indicate the general type of such cooperation.', 'Jeśli tak, prosimy wskazać ogólny charakter takiej współpracy.'),
            options: [
              t('Formal contracted sub-agents', 'Formalni subagenci na podstawie umowy'),
              t('Freelance recruiters', 'Rekruterzy freelancerzy'),
              t('Referral partners', 'Partnerzy polecający'),
              t('Local education consultants', 'Lokalni konsultanci edukacyjni'),
              t('School counsellors', 'Doradcy szkolni')
            ], other: true },
          { id: '6.3', type: 'textarea', label: t('In which countries or regions are such third parties active?', 'W jakich krajach lub regionach działają takie podmioty trzecie?') },
          { id: '6.4', type: 'yesno', label: t('Does your agency verify whether such third parties operate legally and ethically?', 'Czy agencja weryfikuje, czy takie podmioty trzecie działają legalnie i etycznie?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('Not applicable', 'Nie dotyczy')] },
          { id: '6.4a', type: 'textarea', label: t('Please describe the verification process', 'Prosimy opisać proces weryfikacji') },
          { id: '6.5', type: 'yesno', label: t('Does your agency remain fully responsible for the actions, communication and candidate handling of any third party involved in recruitment for VIZJA University?', 'Czy agencja pozostaje w pełni odpowiedzialna za działania, komunikację i obsługę kandydatów przez każdy podmiot trzeci zaangażowany w rekrutację dla VIZJA University?') },
          { id: '6.6', type: 'confirm', label: t('Please confirm that no third party may claim to represent VIZJA University directly unless expressly approved in writing by VIZJA University.', 'Prosimy potwierdzić, że żaden podmiot trzeci nie może twierdzić, że reprezentuje VIZJA University bezpośrednio, o ile nie zostanie to wyraźnie zatwierdzone na piśmie przez VIZJA University.') },
          { id: '6.7', type: 'confirm', label: t('Please confirm that, upon reasonable request in case of a compliance concern, complaint, suspected fraud or investigation, the agency will provide VIZJA University with sufficient information to identify the third party involved in a specific candidate’s case.', 'Prosimy potwierdzić, że na uzasadnione żądanie w przypadku obaw dotyczących zgodności, skargi, podejrzenia oszustwa lub postępowania wyjaśniającego agencja przekaże VIZJA University informacje wystarczające do zidentyfikowania podmiotu trzeciego zaangażowanego w sprawę konkretnego kandydata.') }
        ]
      },
      {
        id: '7', title: t('Candidate Information and Transparency', 'Informowanie Kandydatów i Przejrzystość'),
        fields: [
          { id: '7.1', type: 'rowsYesNo', label: t('Please confirm that candidates are clearly informed about:', 'Prosimy potwierdzić, że kandydaci są jasno informowani o:'),
            rows: [
              t('Full name and location of VIZJA University', 'Pełnej nazwie i lokalizacji VIZJA University'),
              t('Chosen programme and level of study', 'Wybranym programie i poziomie studiów'),
              t('Language of instruction', 'Języku wykładowym'),
              t('Admission requirements', 'Wymaganiach rekrutacyjnych'),
              t('Tuition fees', 'Opłatach za studia'),
              t('Payment deadlines', 'Terminach płatności'),
              t('Refund rules', 'Zasadach zwrotów'),
              t('Visa application responsibility', 'Odpowiedzialności za wniosek wizowy'),
              t('Obligation to genuinely study after enrolment', 'Obowiązku rzeczywistego studiowania po przyjęciu'),
              t('Obligation to attend classes', 'Obowiązku uczęszczania na zajęcia'),
              t('Consequences of non-enrolment or non-attendance', 'Konsekwencjach niepodjęcia studiów lub nieobecności')
            ] },
          { id: '7.2', type: 'checkboxes', label: t('Please describe how candidates receive this information.', 'Prosimy opisać, w jaki sposób kandydaci otrzymują te informacje.'),
            options: [
              t('Website', 'Strona internetowa'),
              t('Email', 'E-mail'),
              t('Printed materials', 'Materiały drukowane'),
              t('Counselling session', 'Sesja doradcza'),
              t('Online meeting', 'Spotkanie online'),
              t('Social media / messaging app', 'Media społecznościowe / komunikatory')
            ], other: true },
          { id: '7.3', type: 'yesno', label: t('Are candidates informed that they may contact VIZJA University directly to verify information received from the agency?', 'Czy kandydaci są informowani, że mogą skontaktować się bezpośrednio z VIZJA University w celu weryfikacji informacji otrzymanych od agencji?') }
        ]
      },
      {
        id: '8', title: t('Document Handling and Verification', 'Obsługa i Weryfikacja Dokumentów'),
        fields: [
          { id: '8.1', type: 'yesno', label: t('Does your agency assist candidates in preparing or collecting application documents?', 'Czy agencja pomaga kandydatom w przygotowaniu lub zebraniu dokumentów aplikacyjnych?') },
          { id: '8.2', type: 'yesno', label: t('Does your agency check documents before submitting them to VIZJA University?', 'Czy agencja sprawdza dokumenty przed przekazaniem ich do VIZJA University?') },
          { id: '8.2a', type: 'rowsCheck', label: t('If yes, please indicate what is checked:', 'Jeśli tak, prosimy wskazać, co jest sprawdzane:'),
            rows: [
              t('Completeness of application file', 'Kompletność akt aplikacyjnych'),
              t('Consistency of candidate’s personal data', 'Spójność danych osobowych kandydata'),
              t('Validity of passport', 'Ważność paszportu'),
              t('Educational documents', 'Dokumenty edukacyjne'),
              t('Translations, if required', 'Tłumaczenia, jeśli wymagane'),
              t('Language documents', 'Dokumenty językowe'),
              t('Payment confirmations', 'Potwierdzenia płatności')
            ], other: true },
          { id: '8.3', type: 'textarea', label: t('Please describe your document handling process.', 'Prosimy opisać proces obsługi dokumentów.') },
          { id: '8.4', type: 'rowsConfirm', label: t('Please confirm the following:', 'Prosimy potwierdzić następujące:'),
            rows: [
              t('The agency will not create, modify, forge or alter any candidate document', 'Agencja nie będzie tworzyć, modyfikować, fałszować ani zmieniać żadnego dokumentu kandydata'),
              t('The agency will not submit documents that it knows or suspects to be false', 'Agencja nie będzie składać dokumentów, o których wie lub podejrzewa, że są fałszywe'),
              t('The agency will not hide inconsistencies in candidate documents', 'Agencja nie będzie ukrywać niespójności w dokumentach kandydata'),
              t('The agency will not encourage candidates to provide misleading information', 'Agencja nie będzie zachęcać kandydatów do podawania wprowadzających w błąd informacji'),
              t('The agency will immediately inform VIZJA University of suspected document irregularities', 'Agencja niezwłocznie poinformuje VIZJA University o podejrzeniu nieprawidłowości w dokumentach')
            ] }
        ]
      },
      {
        id: '9', title: t('Fees Charged to Candidates', 'Opłaty Pobierane od Kandydatów'),
        intro: t('VIZJA University does not require the agency to provide copies of its contracts with candidates. However, for transparency and compliance purposes, the agency is required to disclose the categories of fees charged to candidates.',
                 'VIZJA University nie wymaga od agencji przekazywania kopii umów z kandydatami. Jednak ze względu na przejrzystość i zgodność agencja jest zobowiązana do ujawnienia kategorii opłat pobieranych od kandydatów.'),
        fields: [
          { id: '9.1', type: 'yesno', label: t('Does your agency charge candidates any service fees?', 'Czy agencja pobiera od kandydatów jakiekolwiek opłaty za usługi?') },
          { id: '9.2', type: 'feeTable', label: t('If yes, please list the categories of fees charged to candidates.', 'Jeśli tak, prosimy wymienić kategorie opłat pobieranych od kandydatów.'),
            rows: [
              t('Counselling / advisory fee', 'Opłata za doradztwo'),
              t('Application support fee', 'Opłata za wsparcie aplikacyjne'),
              t('Document support fee', 'Opłata za wsparcie dokumentowe'),
              t('Visa support fee, if legally provided', 'Opłata za wsparcie wizowe, jeśli świadczone zgodnie z prawem'),
              t('Translation / courier / external service fee', 'Opłata za tłumaczenie / kuriera / usługi zewnętrzne')
            ], allowOther: true },
          { id: '9.3', type: 'yesno', label: t('Are candidates informed in writing which fees are charged by the agency and which fees are official VIZJA University fees?', 'Czy kandydaci są informowani na piśmie, które opłaty pobiera agencja, a które są oficjalnymi opłatami VIZJA University?') },
          { id: '9.4', type: 'yesno', label: t('Does the agency issue receipts, invoices or payment confirmations to candidates?', 'Czy agencja wystawia kandydatom pokwitowania, faktury lub potwierdzenia płatności?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('In selected cases only', 'Tylko w wybranych przypadkach')] },
          { id: '9.4a', type: 'textarea', label: t('Please explain', 'Prosimy o wyjaśnienie') },
          { id: '9.5', type: 'rowsConfirm', label: t('Please confirm the following:', 'Prosimy potwierdzić następujące:'),
            rows: [
              t('The agency will not present its own service fees as VIZJA University fees', 'Agencja nie będzie przedstawiać własnych opłat za usługi jako opłat VIZJA University'),
              t('The agency will not charge hidden or undisclosed fees', 'Agencja nie będzie pobierać ukrytych ani nieujawnionych opłat'),
              t('The agency will not charge candidates for “guaranteeing” a visa', 'Agencja nie będzie pobierać od kandydatów opłat za „gwarancję” wizy'),
              t('The agency will not mislead candidates about tuition fees or refund rules', 'Agencja nie będzie wprowadzać kandydatów w błąd co do opłat za studia lub zasad zwrotów'),
              t('The agency will provide candidates with clear information about all agency fees', 'Agencja przekaże kandydatom jasne informacje o wszystkich opłatach agencji'),
              t('The agency will disclose to VIZJA University the categories of fees charged to candidates', 'Agencja ujawni VIZJA University kategorie opłat pobieranych od kandydatów')
            ] }
        ]
      },
      {
        id: '10', title: t('Visa and Immigration Communication', 'Komunikacja Wizowa i Imigracyjna'),
        fields: [
          { id: '10.1', type: 'yesno', label: t('Does your agency provide visa-related guidance to candidates?', 'Czy agencja udziela kandydatom wskazówek dotyczących wiz?') },
          { id: '10.2', type: 'textarea', label: t('If yes, please describe the scope of such guidance.', 'Jeśli tak, prosimy opisać zakres takich wskazówek.') },
          { id: '10.3', type: 'yesno', label: t('Is your agency legally authorised to provide visa or immigration advice in the relevant country, if such authorisation is required?', 'Czy agencja jest prawnie upoważniona do udzielania porad wizowych lub imigracyjnych w danym kraju, jeśli takie upoważnienie jest wymagane?'),
            options: [t('Yes', 'Tak'), t('No', 'Nie'), t('Not applicable', 'Nie dotyczy')] },
          { id: '10.4', type: 'rowsConfirm', label: t('Please confirm the following:', 'Prosimy potwierdzić następujące:'),
            rows: [
              t('The agency will not guarantee that a candidate will obtain a visa', 'Agencja nie będzie gwarantować, że kandydat uzyska wizę'),
              t('The agency will not suggest that admission to VIZJA University automatically results in visa issuance', 'Agencja nie będzie sugerować, że przyjęcie na VIZJA University automatycznie skutkuje wydaniem wizy'),
              t('The agency will not suggest that VIZJA University can influence visa decisions', 'Agencja nie będzie sugerować, że VIZJA University może wpływać na decyzje wizowe'),
              t('The agency will not encourage candidates to submit false information to consular or immigration authorities', 'Agencja nie będzie zachęcać kandydatów do podawania fałszywych informacji organom konsularnym lub imigracyjnym'),
              t('The agency will not promote studies mainly as a route to migration rather than education', 'Agencja nie będzie promować studiów głównie jako drogi do migracji, a nie edukacji'),
              t('The agency will not advise candidates that attendance at classes is optional or irrelevant', 'Agencja nie będzie informować kandydatów, że obecność na zajęciach jest opcjonalna lub nieistotna')
            ] }
        ]
      },
      {
        id: '11', title: t('Marketing and Use of VIZJA University Materials', 'Marketing i Wykorzystanie Materiałów VIZJA University'),
        fields: [
          { id: '11.1', type: 'yesno', label: t('Does your agency prepare its own marketing materials about universities or study destinations?', 'Czy agencja przygotowuje własne materiały marketingowe dotyczące uczelni lub kierunków studiów?') },
          { id: '11.2', type: 'yesno', label: t('Does your agency intend to prepare or use any materials referring to VIZJA University?', 'Czy agencja zamierza przygotować lub wykorzystać jakiekolwiek materiały odnoszące się do VIZJA University?') },
          { id: '11.3', type: 'confirm', label: t('Please confirm that any materials referring to VIZJA University, its programmes, fees, admission requirements, refund rules or visa-related information must be approved by VIZJA University before use.', 'Prosimy potwierdzić, że wszelkie materiały odnoszące się do VIZJA University, jej programów, opłat, wymagań rekrutacyjnych, zasad zwrotów lub informacji wizowych muszą zostać zatwierdzone przez VIZJA University przed użyciem.') },
          { id: '11.4', type: 'confirm', label: t('Please confirm that the agency will not use the VIZJA University name, logo, brand, visual identity or official materials without prior approval.', 'Prosimy potwierdzić, że agencja nie będzie używać nazwy, logo, marki, identyfikacji wizualnej ani oficjalnych materiałów VIZJA University bez uprzedniej zgody.') },
          { id: '11.5', type: 'checkboxes', label: t('Please list the types of channels where VIZJA University may be promoted by the agency.', 'Prosimy wymienić rodzaje kanałów, w których agencja może promować VIZJA University.'),
            options: [
              t('Agency website', 'Strona internetowa agencji'),
              t('Social media', 'Media społecznościowe'),
              t('Paid online campaigns', 'Płatne kampanie internetowe'),
              t('Messaging apps', 'Komunikatory'),
              t('Education fairs', 'Targi edukacyjne'),
              t('School presentations', 'Prezentacje w szkołach'),
              t('Printed materials', 'Materiały drukowane')
            ], other: true }
        ]
      },
      {
        id: '12', title: t('Complaints and Compliance Concerns', 'Skargi i Kwestie Zgodności'),
        fields: [
          { id: '12.1', type: 'yesno', label: t('Does your agency have a procedure for handling candidate complaints?', 'Czy agencja posiada procedurę rozpatrywania skarg kandydatów?') },
          { id: '12.1a', type: 'textarea', label: t('Please describe briefly', 'Prosimy o krótki opis') },
          { id: '12.2', type: 'yesno', label: t('Has your agency received candidate complaints related to international student recruitment in the last 12 months?', 'Czy w ciągu ostatnich 12 miesięcy agencja otrzymała skargi kandydatów związane z rekrutacją studentów zagranicznych?') },
          { id: '12.2a', type: 'checkboxes', label: t('If yes, please indicate the general category of complaints, without disclosing confidential personal data:', 'Jeśli tak, prosimy wskazać ogólną kategorię skarg, bez ujawniania poufnych danych osobowych:'),
            options: [
              t('Fees', 'Opłaty'),
              t('Visa information', 'Informacje wizowe'),
              t('Admission information', 'Informacje rekrutacyjne'),
              t('Refunds', 'Zwroty'),
              t('Documents', 'Dokumenty'),
              t('Miscommunication', 'Nieporozumienia komunikacyjne')
            ], other: true },
          { id: '12.3', type: 'rowsConfirm', label: t('Please confirm that the agency will immediately inform VIZJA University about any complaint, allegation or concern related to:', 'Prosimy potwierdzić, że agencja niezwłocznie poinformuje VIZJA University o wszelkich skargach, zarzutach lub obawach dotyczących:'),
            rows: [
              t('Misleading information about VIZJA University', 'Wprowadzających w błąd informacji o VIZJA University'),
              t('Hidden or unauthorised fees', 'Ukrytych lub nieautoryzowanych opłat'),
              t('Visa guarantees or misleading visa claims', 'Gwarancji wizowych lub wprowadzających w błąd twierdzeń wizowych'),
              t('Suspected forged documents', 'Podejrzenia sfałszowanych dokumentów'),
              t('Candidate impersonation', 'Podszywania się pod kandydata'),
              t('Misuse of VIZJA University name or logo', 'Niewłaściwego użycia nazwy lub logo VIZJA University'),
              t('Misconduct by sub-agents or third parties', 'Naruszeń ze strony subagentów lub podmiotów trzecich'),
              t('Any other serious compliance concern', 'Wszelkich innych poważnych obaw dotyczących zgodności')
            ] }
        ]
      },
      {
        id: '13', title: t('Monitoring and Audit', 'Monitorowanie i Audyt'),
        fields: [
          { id: '13.1', type: 'confirm', label: t('Please confirm that VIZJA University may monitor the quality of applications submitted by the agency.', 'Prosimy potwierdzić, że VIZJA University może monitorować jakość wniosków składanych przez agencję.') },
          { id: '13.2', type: 'confirm', label: t('Please confirm that VIZJA University may contact candidates directly to verify information provided during the recruitment process.', 'Prosimy potwierdzić, że VIZJA University może kontaktować się bezpośrednio z kandydatami w celu weryfikacji informacji podanych podczas procesu rekrutacji.') },
          { id: '13.3', type: 'confirm', label: t('Please confirm that, in case of a complaint, suspected misconduct or compliance concern, the agency will cooperate with VIZJA University and provide relevant explanations and documents reasonably necessary to investigate the matter.', 'Prosimy potwierdzić, że w przypadku skargi, podejrzenia naruszenia lub obaw dotyczących zgodności agencja będzie współpracować z VIZJA University oraz przekaże stosowne wyjaśnienia i dokumenty rozsądnie niezbędne do zbadania sprawy.') },
          { id: '13.4', type: 'confirm', label: t('Please confirm that VIZJA University may suspend cooperation with the agency while serious compliance concerns are being reviewed.', 'Prosimy potwierdzić, że VIZJA University może zawiesić współpracę z agencją na czas rozpatrywania poważnych obaw dotyczących zgodności.') }
        ]
      },
      {
        id: '14', title: t('Data Protection', 'Ochrona Danych'),
        fields: [
          { id: '14.1', type: 'textarea', label: t('Please describe how your agency obtains candidate consent to collect, process and share personal data with universities.', 'Prosimy opisać, w jaki sposób agencja uzyskuje zgodę kandydata na zbieranie, przetwarzanie i udostępnianie danych osobowych uczelniom.') },
          { id: '14.2', type: 'confirm', label: t('Please confirm that candidate personal data will be processed only for legitimate recruitment and admission purposes.', 'Prosimy potwierdzić, że dane osobowe kandydatów będą przetwarzane wyłącznie w uzasadnionych celach rekrutacyjnych i przyjęciowych.') },
          { id: '14.3', type: 'confirm', label: t('Please confirm that candidate personal data will not be sold or transferred to unauthorised third parties.', 'Prosimy potwierdzić, że dane osobowe kandydatów nie będą sprzedawane ani przekazywane nieuprawnionym podmiotom trzecim.') },
          { id: '14.4', type: 'textarea', label: t('Please briefly describe how candidate documents and personal data are protected.', 'Prosimy krótko opisać, w jaki sposób chronione są dokumenty i dane osobowe kandydatów.') }
        ]
      },
      {
        id: '15', title: t('Final Declarations', 'Oświadczenia Końcowe'),
        fields: [
          { id: '15', type: 'rowsConfirm', label: t('The agency confirms that:', 'Agencja potwierdza, że:'),
            rows: [
              t('The information provided in this form is true, accurate and complete', 'Informacje podane w niniejszym formularzu są prawdziwe, dokładne i kompletne'),
              t('The agency operates lawfully in the country/countries where it conducts recruitment', 'Agencja działa zgodnie z prawem w kraju/krajach, w których prowadzi rekrutację'),
              t('The agency will follow VIZJA University admission and compliance rules', 'Agencja będzie przestrzegać zasad rekrutacji i zgodności VIZJA University'),
              t('The agency will not mislead candidates about admission, visas, fees, refunds or study obligations', 'Agencja nie będzie wprowadzać kandydatów w błąd co do przyjęć, wiz, opłat, zwrotów ani obowiązków studiowania'),
              t('The agency will not submit false, forged or misleading documents', 'Agencja nie będzie składać fałszywych, sfałszowanych ani wprowadzających w błąd dokumentów'),
              t('The agency will not guarantee visas or immigration outcomes', 'Agencja nie będzie gwarantować wiz ani wyników imigracyjnych'),
              t('The agency will disclose to candidates all categories of fees charged by the agency', 'Agencja ujawni kandydatom wszystkie kategorie opłat pobieranych przez agencję'),
              t('The agency understands that cooperation with VIZJA University requires a written agreement', 'Agencja rozumie, że współpraca z VIZJA University wymaga pisemnej umowy'),
              t('The agency understands that breach of compliance obligations may result in suspension or termination of cooperation', 'Agencja rozumie, że naruszenie obowiązków zgodności może skutkować zawieszeniem lub zakończeniem współpracy')
            ] }
        ]
      },
      {
        id: '16', title: t('Signature', 'Podpis'),
        intro: t('I confirm that I am authorised to complete and sign this form on behalf of the agency.',
                 'Potwierdzam, że jestem upoważniony/a do wypełnienia i podpisania niniejszego formularza w imieniu agencji.'),
        fields: [
          { id: '16.name', type: 'text', label: t('Name', 'Imię i nazwisko') },
          { id: '16.position', type: 'text', label: t('Position', 'Stanowisko') },
          { id: '16.agency', type: 'text', label: t('Agency', 'Agencja') },
          { id: '16.date', type: 'date', label: t('Date', 'Data') },
          { id: '16.signature', type: 'text', label: t('Signature (type full name to sign)', 'Podpis (wpisz pełne imię i nazwisko, aby podpisać)') }
        ]
      }
    ]
  };

  // ---- Internal assessment schema (reviewer-only, file 2) ----
  const assessmentSchema = {
    title: t('Agent Due Diligence Assessment', 'Ocena Due Diligence Agenta'),
    subtitle: t('Internal Use Only', 'Wyłącznie do użytku wewnętrznego'),
    meta: [
      { id: 'reviewer', label: t('Reviewer', 'Recenzent') },
      { id: 'department', label: t('Department', 'Dział') },
      { id: 'date', type: 'date', label: t('Date', 'Data') }
    ],
    completeness: {
      title: t('A. Completeness Check', 'A. Kontrola Kompletności'),
      items: [
        t('Completed due diligence form', 'Wypełniony formularz due diligence'),
        t('Company registration document / registry link', 'Dokument rejestrowy firmy / link do rejestru'),
        t('Licence / permit information, if applicable', 'Informacje o licencji / zezwoleniu, jeśli dotyczy'),
        t('Ownership / management information', 'Informacje o własności / zarządzaniu'),
        t('Description of recruitment process', 'Opis procesu rekrutacji'),
        t('Disclosure of candidate fee categories', 'Ujawnienie kategorii opłat kandydatów'),
        t('Confirmation regarding sub-agents / third parties', 'Potwierdzenie dotyczące subagentów / podmiotów trzecich'),
        t('Confirmation regarding visa communication', 'Potwierdzenie dotyczące komunikacji wizowej'),
        t('Marketing and brand use confirmation', 'Potwierdzenie dotyczące marketingu i użycia marki'),
        t('Data protection confirmation', 'Potwierdzenie dotyczące ochrony danych'),
        t('Final declarations signed', 'Podpisane oświadczenia końcowe')
      ]
    },
    risk: {
      title: t('B. Risk Assessment (1 = low, 3 = medium, 5 = high)', 'B. Ocena Ryzyka (1 = niskie, 3 = średnie, 5 = wysokie)'),
      areas: [
        t('Legal registration and transparency', 'Rejestracja prawna i przejrzystość'),
        t('Experience in international student recruitment', 'Doświadczenie w rekrutacji studentów zagranicznych'),
        t('Transparency of fees charged to candidates', 'Przejrzystość opłat pobieranych od kandydatów'),
        t('Recruitment process quality', 'Jakość procesu rekrutacji'),
        t('Use of sub-agents or third parties', 'Korzystanie z subagentów lub podmiotów trzecich'),
        t('Visa-related communication', 'Komunikacja wizowa'),
        t('Marketing and use of VIZJA University brand', 'Marketing i użycie marki VIZJA University'),
        t('Document handling and verification', 'Obsługa i weryfikacja dokumentów'),
        t('Data protection', 'Ochrona danych'),
        t('Complaint / reputational risk', 'Ryzyko skarg / reputacyjne'),
        t('Country / regional migration risk', 'Ryzyko migracyjne kraju / regionu')
      ]
    },
    redFlags: {
      title: t('C. Red Flags', 'C. Sygnały Ostrzegawcze'),
      items: [
        t('Agent claims to guarantee visas', 'Agent twierdzi, że gwarantuje wizy'),
        t('Agent promotes studies mainly as a migration route', 'Agent promuje studia głównie jako drogę migracji'),
        t('Agent refuses to disclose categories of candidate fees', 'Agent odmawia ujawnienia kategorii opłat kandydatów'),
        t('Agent charges unclear or potentially excessive fees', 'Agent pobiera niejasne lub potencjalnie nadmierne opłaty'),
        t('Agent uses misleading admission or visa claims', 'Agent używa wprowadzających w błąd twierdzeń o przyjęciu lub wizie'),
        t('Agent uses or intends to use unapproved VIZJA University materials', 'Agent używa lub zamierza używać niezatwierdzonych materiałów VIZJA University'),
        t('Agent uses third parties but has no control over them', 'Agent korzysta z podmiotów trzecich, ale nie ma nad nimi kontroli'),
        t('Agent refuses candidate direct verification by VIZJA University', 'Agent odmawia bezpośredniej weryfikacji kandydata przez VIZJA University'),
        t('Agent refuses cooperation in case of complaint or suspected misconduct', 'Agent odmawia współpracy w przypadku skargi lub podejrzenia naruszenia'),
        t('Agent cannot prove lawful operation', 'Agent nie potrafi udowodnić legalnej działalności')
      ]
    },
    decision: {
      title: t('D. Recommended Decision', 'D. Rekomendowana Decyzja'),
      options: [
        t('Approved', 'Zatwierdzony'),
        t('Approved conditionally', 'Zatwierdzony warunkowo'),
        t('Further information required', 'Wymagane dalsze informacje'),
        t('Rejected', 'Odrzucony'),
        t('Escalate to Legal / Compliance', 'Eskalacja do Działu Prawnego / Compliance')
      ]
    },
    conditions: {
      title: t('E. Conditions of Approval, if any', 'E. Warunki Zatwierdzenia, jeśli dotyczy'),
      placeholder: t('e.g. Agent must remove misleading visa-related statements; provide clearer fee categories; complete training; submit only under enhanced monitoring during the first cycle.',
                     'np. Agent musi usunąć wprowadzające w błąd stwierdzenia wizowe; podać jaśniejsze kategorie opłat; ukończyć szkolenie; składać wnioski wyłącznie pod wzmożonym monitoringiem w pierwszym cyklu.')
    },
    monitoring: {
      title: t('F. Monitoring Level', 'F. Poziom Monitorowania'),
      options: [
        t('Standard monitoring', 'Monitoring standardowy'),
        t('Enhanced monitoring', 'Monitoring wzmożony'),
        t('High-risk monitoring', 'Monitoring wysokiego ryzyka'),
        t('Not approved', 'Niezatwierdzony')
      ]
    },
    approval: {
      title: t('G. Approval', 'G. Zatwierdzenie'),
      finalOptions: [
        t('Approved', 'Zatwierdzony'),
        t('Approved conditionally', 'Zatwierdzony warunkowo'),
        t('Rejected', 'Odrzucony')
      ]
    }
  };

  const api = { formSchema, assessmentSchema };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.VIZJA_SCHEMA = api;
})(typeof window !== 'undefined' ? window : this);
