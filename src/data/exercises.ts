export interface Exercise {
    id: string;
    category: 'beginner' | 'intermediate' | 'advanced';
    title: {
        it: string;
        en: string;
    };
    description: {
        it: string;
        en: string;
    };
}

export const exercises: Exercise[] = [
    // --- PRINCIPIANTE (1-33) ---
    {
        id: '1',
        category: 'beginner',
        title: { it: 'Saluto Personale', en: 'Personal Greeting' },
        description: {
            it: 'Leggi il nome dell\'utente e stampa "Ciao [Nome]!".',
            en: 'Read the user\'s name and print "Hello [Name]!".'
        }
    },
    {
        id: '2',
        category: 'beginner',
        title: { it: 'Somma di due numeri', en: 'Sum of two numbers' },
        description: {
            it: 'Leggi due numeri (A e B) e stampa la loro somma.',
            en: 'Read two numbers (A and B) and print their sum.'
        }
    },
    {
        id: '3',
        category: 'beginner',
        title: { it: 'Calcolo Area Rettangolo', en: 'Rectangle Area Calculation' },
        description: {
            it: 'Leggi base e altezza di un rettangolo e calcola l\'area.',
            en: 'Read the base and height of a rectangle and calculate the area.'
        }
    },
    {
        id: '4',
        category: 'beginner',
        title: { it: 'Prodotto di tre numeri', en: 'Product of three numbers' },
        description: {
            it: 'Leggi tre numeri e visualizza il loro prodotto.',
            en: 'Read three numbers and display their product.'
        }
    },
    {
        id: '5',
        category: 'beginner',
        title: { it: 'Differenza Semplice', en: 'Simple Difference' },
        description: {
            it: 'Leggi due numeri e stampa la differenza (A - B).',
            en: 'Read two numbers and print the difference (A - B).'
        }
    },
    {
        id: '6',
        category: 'beginner',
        title: { it: 'Convertitore Anni in Giorni', en: 'Years to Days Converter' },
        description: {
            it: 'Leggi l\'età di una persona e stima quanti giorni ha vissuto (usa 365 giorni per anno).',
            en: 'Read a person\'s age and estimate how many days they have lived (use 365 days per year).'
        }
    },
    {
        id: '7',
        category: 'beginner',
        title: { it: 'Media di due voti', en: 'Average of two grades' },
        description: {
            it: 'Leggi due voti scolastici e calcola la media aritmetica.',
            en: 'Read two school grades and calculate the arithmetic mean.'
        }
    },
    {
        id: '8',
        category: 'beginner',
        title: { it: 'Divisione Intera', en: 'Integer Division' },
        description: {
            it: 'Leggi due numeri interi e stampa il quoziente della divisione.',
            en: 'Read two integers and print the quotient of the division.'
        }
    },
    {
        id: '9',
        category: 'beginner',
        title: { it: 'Resto della Divisione', en: 'Remainder of Division' },
        description: {
            it: 'Leggi due numeri e calcola il resto (modulo) della divisione tra loro.',
            en: 'Read two numbers and calculate the remainder (modulo) of the division between them.'
        }
    },
    {
        id: '10',
        category: 'beginner',
        title: { it: 'Doppio e Triplo', en: 'Double and Triple' },
        description: {
            it: 'Leggi un numero e stampa il suo doppio e il suo triplo.',
            en: 'Read a number and print its double and triple.'
        }
    },
    {
        id: '11',
        category: 'beginner',
        title: { it: 'Area del Triangolo', en: 'Triangle Area' },
        description: {
            it: 'Leggi base e altezza e calcola l\'area del triangolo.',
            en: 'Read base and height and calculate the triangle\'s area.'
        }
    },
    {
        id: '12',
        category: 'beginner',
        title: { it: 'Perimetro del Quadrato', en: 'Square Perimeter' },
        description: {
            it: 'Leggi il lato di un quadrato e calcola il perimetro.',
            en: 'Read the side of a square and calculate the perimeter.'
        }
    },
    {
        id: '13',
        category: 'beginner',
        title: { it: 'Successivo e Precedente', en: 'Next and Previous' },
        description: {
            it: 'Leggi un numero intero e stampa il numero che lo segue e quello che lo precede.',
            en: 'Read an integer and print the number following it and the one preceding it.'
        }
    },
    {
        id: '14',
        category: 'beginner',
        title: { it: 'Metri in Centimetri', en: 'Meters to Centimeters' },
        description: {
            it: 'Converti una misura in metri letta in input in centimetri.',
            en: 'Convert a measurement in meters read as input into centimeters.'
        }
    },
    {
        id: '15',
        category: 'beginner',
        title: { it: 'Calcolo Prezzo Scontato', en: 'Discounted Price Calculation' },
        description: {
            it: 'Leggi il prezzo di un prodotto e applica uno sconto fisso del 10%.',
            en: 'Read a product price and apply a fixed 10% discount.'
        }
    },
    {
        id: '16',
        category: 'beginner',
        title: { it: 'Cambio Valuta (Euro-Dollaro)', en: 'Currency Exchange (Euro-Dollar)' },
        description: {
            it: 'Converti una cifra in Euro in Dollari (usa un tasso di cambio fisso a tua scelta).',
            en: 'Convert an amount in Euro to Dollars (use a fixed exchange rate of your choice).'
        }
    },
    {
        id: '17',
        category: 'beginner',
        title: { it: 'Volume del Cubo', en: 'Cube Volume' },
        description: {
            it: 'Leggi lo spigolo di un cubo e calcola il volume.',
            en: 'Read the edge of a cube and calculate the volume.'
        }
    },
    {
        id: '18',
        category: 'beginner',
        title: { it: 'Prezzo Finale con IVA', en: 'Final Price with VAT' },
        description: {
            it: 'Leggi un prezzo netto e aggiungi l\'IVA al 22%.',
            en: 'Read a net price and add 22% VAT.'
        }
    },
    {
        id: '19',
        category: 'beginner',
        title: { it: 'Media di 4 numeri', en: 'Average of 4 numbers' },
        description: {
            it: 'Leggi quattro numeri e stampa la loro media.',
            en: 'Read four numbers and print their average.'
        }
    },
    {
        id: '20',
        category: 'beginner',
        title: { it: 'Minuti in Secondi', en: 'Minutes to Seconds' },
        description: {
            it: 'Leggi un valore in minuti e visualizza il corrispondente in secondi.',
            en: 'Read a value in minutes and display the equivalent in seconds.'
        }
    },
    {
        id: '21',
        category: 'beginner',
        title: { it: 'Energia Cinetica Semplice', en: 'Simple Kinetic Energy' },
        description: {
            it: 'Dati massa (m) e velocità (v), calcola E = 1/2 * m * v^2.',
            en: 'Given mass (m) and velocity (v), calculate E = 1/2 * m * v^2.'
        }
    },
    {
        id: '22',
        category: 'beginner',
        title: { it: 'Calcolo Peso Specifico', en: 'Specific Weight Calculation' },
        description: {
            it: 'Leggi peso e volume e calcola il peso specifico (P/V).',
            en: 'Read weight and volume and calculate specific weight (P/V).'
        }
    },
    {
        id: '23',
        category: 'beginner',
        title: { it: 'Inversione Valori', en: 'Value Swapping' },
        description: {
            it: 'Leggi due valori A e B e scambiali tra loro visualizzando il risultato.',
            en: 'Read two values A and B and swap them, displaying the result.'
        }
    },
    {
        id: '24',
        category: 'beginner',
        title: { it: 'Potenza del 2', en: 'Power of 2' },
        description: {
            it: 'Leggi un numero e calcola il suo quadrato.',
            en: 'Read a number and calculate its square.'
        }
    },
    {
        id: '25',
        category: 'beginner',
        title: { it: 'Sconto Variabile', en: 'Variable Discount' },
        description: {
            it: 'Leggi prezzo e percentuale di sconto, stampa il prezzo finale.',
            en: 'Read price and discount percentage, print the final price.'
        }
    },
    {
        id: '26',
        category: 'beginner',
        title: { it: 'Celsius in Fahrenheit', en: 'Celsius to Fahrenheit' },
        description: {
            it: 'Leggi gradi Celsius e convertili in Fahrenheit: (C * 9/5) + 32.',
            en: 'Read Celsius degrees and convert to Fahrenheit: (C * 9/5) + 32.'
        }
    },
    {
        id: '27',
        category: 'beginner',
        title: { it: 'Ore in Minuti', en: 'Hours to Minutes' },
        description: {
            it: 'Converti un numero di ore dato in input in minuti.',
            en: 'Convert a given number of hours in input to minutes.'
        }
    },
    {
        id: '28',
        category: 'beginner',
        title: { it: 'Superficie Totale Cubo', en: 'Cube Total Surface Area' },
        description: {
            it: 'Dato il lato, calcola l\'area di una faccia e moltiplica per 6.',
            en: 'Given the side, calculate the area of one face and multiply by 6.'
        }
    },
    {
        id: '29',
        category: 'beginner',
        title: { it: 'Ipotenusa (Teo. Pitagora)', en: 'Hypotenuse (Pythagorean Theorem)' },
        description: {
            it: 'Leggi i due cateti e calcola l\'ipotenusa (radice quadrata di a^2 + b^2).',
            en: 'Read the two legs and calculate the hypotenuse (square root of a^2 + b^2).'
        }
    },
    {
        id: '30',
        category: 'beginner',
        title: { it: 'Spazio percorso', en: 'Distance traveled' },
        description: {
            it: 'Calcola lo spazio percorso conoscendo velocità costante e tempo (v * t).',
            en: 'Calculate distance traveled knowing constant velocity and time (v * t).'
        }
    },
    {
        id: '31',
        category: 'beginner',
        title: { it: 'Circonferenza Cerchio', en: 'Circle Circumference' },
        description: {
            it: 'Leggi il raggio e calcola la circonferenza (2 * PI * r).',
            en: 'Read the radius and calculate the circumference (2 * PI * r).'
        }
    },
    {
        id: '32',
        category: 'beginner',
        title: { it: 'Suddivisione Spese', en: 'Expense Split' },
        description: {
            it: 'Leggi il totale del conto e il numero di persone, stampa quanto deve pagare ognuno.',
            en: 'Read the bill total and the number of people, print how much each must pay.'
        }
    },
    {
        id: '33',
        category: 'beginner',
        title: { it: 'Ricarica Telefonica', en: 'Phone Top-up' },
        description: {
            it: 'Leggi credito residuo e costo ricarica, calcola il nuovo saldo.',
            en: 'Read remaining credit and top-up cost, calculate the new balance.'
        }
    },

    // --- INTERMEDIO (34-66) ---
    {
        id: '34',
        category: 'intermediate',
        title: { it: 'Positivo o Negativo', en: 'Positive or Negative' },
        description: {
            it: 'Leggi un numero e stampa "Positivo" se > 0, altrimenti "Negativo".',
            en: 'Read a number and print "Positive" if > 0, otherwise "Negative".'
        }
    },
    {
        id: '35',
        category: 'intermediate',
        title: { it: 'Pari o Dispari', en: 'Even or Odd' },
        description: {
            it: 'Leggi un numero e determina se è pari o dispari.',
            en: 'Read a number and determine if it is even or odd.'
        }
    },
    {
        id: '36',
        category: 'intermediate',
        title: { it: 'Il Maggiore di Due', en: 'Maximum of Two' },
        description: {
            it: 'Leggi due numeri e visualizza solo il più grande.',
            en: 'Read two numbers and display only the larger one.'
        }
    },
    {
        id: '37',
        category: 'intermediate',
        title: { it: 'Voto Superato?', en: 'Grade Passed?' },
        description: {
            it: 'Leggi un voto. Se è >= 6 stampa "Promosso", altrimenti "Bocciato".',
            en: 'Read a grade. If it is >= 6 print "Passed", otherwise "Failed".'
        }
    },
    {
        id: '38',
        category: 'intermediate',
        title: { it: 'Maggiore età', en: 'Legal Age' },
        description: {
            it: 'Leggi l\'anno di nascita e determina se la persona è maggiorenne.',
            en: 'Read the birth year and determine if the person is of legal age.'
        }
    },
    {
        id: '39',
        category: 'intermediate',
        title: { it: 'Tariffa Parcheggio', en: 'Parking Fee' },
        description: {
            it: 'Leggi le ore di sosta. Se sono > 2, ogni ora costa 2€, altrimenti costano 1.5€.',
            en: 'Read residency hours. If > 2, each hour costs 2€, otherwise 1.5€.'
        }
    },
    {
        id: '40',
        category: 'intermediate',
        title: { it: 'Il Maggiore di Tre', en: 'Maximum of Three' },
        description: {
            it: 'Leggi tre numeri e trova il valore massimo tra loro.',
            en: 'Read three numbers and find the maximum value among them.'
        }
    },
    {
        id: '41',
        category: 'intermediate',
        title: { it: 'Login Semplice', en: 'Simple Login' },
        description: {
            it: 'Leggi username e password. Se corrispondono a "admin" e "1234", stampa "Accesso Consentito".',
            en: 'Read username and password. If they match "admin" and "1234", print "Access Granted".'
        }
    },
    {
        id: '42',
        category: 'intermediate',
        title: { it: 'Sconto quantitativo', en: 'Quantity Discount' },
        description: {
            it: 'Se compri più di 10 articoli, applichi il 20% di sconto, altrimenti il 5%.',
            en: 'If you buy more than 10 items, apply 20% discount, otherwise 5%.'
        }
    },
    {
        id: '43',
        category: 'intermediate',
        title: { it: 'Termometro Febbre', en: 'Fever Thermometer' },
        description: {
            it: 'Leggi la temperatura corporea. Se > 37.5, scrivi "Hai la febbre".',
            en: 'Read body temperature. If > 37.5, write "You have a fever".'
        }
    },
    {
        id: '44',
        category: 'intermediate',
        title: { it: 'Calcolo BMI', en: 'BMI Calculation' },
        description: {
            it: 'Calcola l\'indice di massa corporea (Peso / Altezza^2) e scrivi se è "Normopeso" (tra 18 e 25).',
            en: 'Calculate body mass index (Weight / Height^2) and write if it is "Normal weight" (between 18 and 25).'
        }
    },
    {
        id: '45',
        category: 'intermediate',
        title: { it: 'Multiplo di 5?', en: 'Multiple of 5?' },
        description: {
            it: 'Controlla se un numero inserito è divisibile per 5 senza resto.',
            en: 'Check if an entered number is divisible by 5 without a remainder.'
        }
    },
    {
        id: '46',
        category: 'intermediate',
        title: { it: 'Intervallo Valido', en: 'Valid Range' },
        description: {
            it: 'Verifica se un numero è compreso tra 10 e 100 (estremi inclusi).',
            en: 'Verify if a number is between 10 and 100 (inclusive).'
        }
    },
    {
        id: '47',
        category: 'intermediate',
        title: { it: 'Esercizio Progressivo', en: 'Progressive Exercise' },
        description: {
            it: 'Leggi un numero N e somma tutti i numeri da 1 a N usando un ciclo.',
            en: 'Read a number N and sum all numbers from 1 to N using a loop.'
        }
    },
    {
        id: '48',
        category: 'intermediate',
        title: { it: 'Conto alla Rovescia', en: 'Countdown' },
        description: {
            it: 'Dato un numero in input, stampa tutti i numeri decrescenti fino a zero.',
            en: 'Given an input number, print all decreasing numbers down to zero.'
        }
    },
    {
        id: '49',
        category: 'intermediate',
        title: { it: 'Tabellina del numero', en: 'Number Times Table' },
        description: {
            it: 'Leggi un numero e stampa la sua tabellina dal 1 al 10.',
            en: 'Read a number and print its times table from 1 to 10.'
        }
    },
    {
        id: '50',
        category: 'intermediate',
        title: { it: 'Media di N numeri', en: 'Average of N numbers' },
        description: {
            it: 'Leggi quanti numeri vuoi inserire, leggili uno per uno e calcola la media finale.',
            en: 'Read how many numbers you want to enter, read them one by one, and calculate the final average.'
        }
    },
    {
        id: '51',
        category: 'intermediate',
        title: { it: 'Trova il Minimo', en: 'Find the Minimum' },
        description: {
            it: 'Leggi 5 numeri e stampa alla fine il più piccolo tra quelli inseriti.',
            en: 'Read 5 numbers and print the smallest one entered at the end.'
        }
    },
    {
        id: '52',
        category: 'intermediate',
        title: { it: 'Password sicura?', en: 'Secure Password?' },
        description: {
            it: 'Verifica se una password letta ha almeno 8 caratteri (supponi di poter leggere la lunghezza).',
            en: 'Check if a read password has at least 8 characters (assume you can read the length).'
        }
    },
    {
        id: '53',
        category: 'intermediate',
        title: { it: 'Raddoppio costante', en: 'Constant Doubling' },
        description: {
            it: 'Parti da 1 e raddoppia il numero finché non superi 1000. Conta quanti passaggi servono.',
            en: 'Start from 1 and double the number until it exceeds 1000. Count how many steps are needed.'
        }
    },
    {
        id: '54',
        category: 'intermediate',
        title: { it: 'Calcolo Fattoriale', en: 'Factorial Calculation' },
        description: {
            it: 'Leggi un numero N e calcola il suo fattoriale (N!).',
            en: 'Read a number N and calculate its factorial (N!).'
        }
    },
    {
        id: '55',
        category: 'intermediate',
        title: { it: 'Numeri Pari tra 1 e 50', en: 'Even Numbers between 1 and 50' },
        description: {
            it: 'Visualizza in output solo i numeri pari compresi tra 1 e 50.',
            en: 'Display only even numbers between 1 and 50 in output.'
        }
    },
    {
        id: '56',
        category: 'intermediate',
        title: { it: 'Classifica Voti', en: 'Grade Classification' },
        description: {
            it: 'Leggi un voto da 1 a 10: 10/9=Ottimo, 8=Distinto, 7=Buono, 6=Suff, <6=Insuff.',
            en: 'Read a grade from 1 to 10: 10/9=Excellent, 8=Very Good, 7=Good, 6=Pass, <6=Fail.'
        }
    },
    {
        id: '57',
        category: 'intermediate',
        title: { it: 'Somma con Tappo', en: 'Sum with Sentinel' },
        description: {
            it: 'Leggi una serie di numeri e sommali. Fermati quando l\'utente inserisce lo zero.',
            en: 'Read a series of numbers and sum them. Stop when the user enters zero.'
        }
    },
    {
        id: '58',
        category: 'intermediate',
        title: { it: 'Potenza Senza Operatore', en: 'Power Without Operator' },
        description: {
            it: 'Calcola base elevata ad esponente usando solo moltiplicazioni e cicli.',
            en: 'Calculate base raised to an exponent using only multiplications and loops.'
        }
    },
    {
        id: '59',
        category: 'intermediate',
        title: { it: 'Pitagora fino a N', en: 'Pythagoras up to N' },
        description: {
            it: 'Stampa i quadrati di tutti i numeri da 1 a N inserito in input.',
            en: 'Print the squares of all numbers from 1 up to an input N.'
        }
    },
    {
        id: '60',
        category: 'intermediate',
        title: { it: 'Controllo Multipli', en: 'Multiple Checklist' },
        description: {
            it: 'Controlla se un numero N è multiplo sia di 2 che di 3.',
            en: 'Check if a number N is a multiple of both 2 and 3.'
        }
    },
    {
        id: '61',
        category: 'intermediate',
        title: { it: 'Anno Bisestile', en: 'Leap Year' },
        description: {
            it: 'Verifica se un anno è bisestile (divisibile per 4 ma non per 100, oppure divisibile per 400).',
            en: 'Check if a year is leap (divisible by 4 but not by 100, or divisible by 400).'
        }
    },
    {
        id: '62',
        category: 'intermediate',
        title: { it: 'Stampa N simboli', en: 'Print N symbols' },
        description: {
            it: 'Leggi un numero e un carattere, stampa quel carattere N volte.',
            en: 'Read a number and a character, print that character N times.'
        }
    },
    {
        id: '63',
        category: 'intermediate',
        title: { it: 'Calcolo Interessi', en: 'Interest Calculation' },
        description: {
            it: 'Dato un capitale, un tasso e gli anni, calcola il montante finale (Interesse Semplice).',
            en: 'Given principal, rate, and years, calculate the final maturity (Simple Interest).'
        }
    },
    {
        id: '64',
        category: 'intermediate',
        title: { it: 'Trova il Maggiore in tempo reale', en: 'Find Max in real time' },
        description: {
            it: 'Leggi 10 numeri e stampa dopo ogni inserimento qual è il massimo trovato finora.',
            en: 'Read 10 numbers and print the maximum found so far after each insertion.'
        }
    },
    {
        id: '65',
        category: 'intermediate',
        title: { it: 'Conversione Binario (Semplice)', en: 'Binary Conversion (Simple)' },
        description: {
            it: 'Leggi un numero tra 0 e 15 e stampa la sua rappresentazione binaria su 4 bit.',
            en: 'Read a number between 0 and 15 and print its binary representation on 4 bits.'
        }
    },
    {
        id: '66',
        category: 'intermediate',
        title: { it: 'Triangolo di Asterischi', en: 'Asterisk Triangle' },
        description: {
            it: 'Leggi un numero N e stampa un triangolo di asterischi con altezza N.',
            en: 'Read a number N and print an asterisk triangle of height N.'
        }
    },

    // --- AVANZATO (67-100) ---
    {
        id: '67',
        category: 'advanced',
        title: { it: 'Numeri Primi', en: 'Prime Numbers' },
        description: {
            it: 'Leggi un numero e determina se è un numero primo.',
            en: 'Read a number and determine if it is a prime number.'
        }
    },
    {
        id: '68',
        category: 'advanced',
        title: { it: 'Serie di Fibonacci', en: 'Fibonacci Series' },
        description: {
            it: 'Genera e stampa i primi N termini della serie di Fibonacci.',
            en: 'Generate and print the first N terms of the Fibonacci series.'
        }
    },
    {
        id: '69',
        category: 'advanced',
        title: { it: 'Massimo Comun Divisore (Euclide)', en: 'Greatest Common Divisor (Euclid)' },
        description: {
            it: 'Calcola il MCD tra due numeri usando l\'algoritmo di Euclide.',
            en: 'Calculate the GCD between two numbers using Euclid\'s algorithm.'
        }
    },
    {
        id: '70',
        category: 'advanced',
        title: { it: 'Inversione Numero', en: 'Number Reversal' },
        description: {
            it: 'Leggi un numero intero (es. 123) e stampa le sue cifre al contrario (321).',
            en: 'Read an integer (e.g., 123) and print its digits in reverse (321).'
        }
    },
    {
        id: '71',
        category: 'advanced',
        title: { it: 'Conversione Decimale-Binario', en: 'Decimal-Binary Conversion' },
        description: {
            it: 'Converti un qualsiasi numero decimale in binario usando il metodo delle divisioni successive.',
            en: 'Convert any decimal number to binary using the successive divisions method.'
        }
    },
    {
        id: '72',
        category: 'advanced',
        title: { it: 'Numero Perfetto', en: 'Perfect Number' },
        description: {
            it: 'Determina se un numero è perfetto (la somma dei suoi divisori, escluso se stesso, è uguale al numero stesso).',
            en: 'Determine if a number is perfect (the sum of its divisors, excluding itself, equals the number itself).'
        }
    },
    {
        id: '73',
        category: 'advanced',
        title: { it: 'Minimo Comune Multiplo', en: 'Least Common Multiple' },
        description: {
            it: 'Calcola il mcm tra due numeri interi.',
            en: 'Calculate the lcm between two integers.'
        }
    },
    {
        id: '74',
        category: 'advanced',
        title: { it: 'Radice Quadrata Approssimata', en: 'Approximate Square Root' },
        description: {
            it: 'Calcola la radice quadrata di un numero usando il metodo delle scomposizioni o per tentativi.',
            en: 'Calculate the square root of a number using decomposition or trial and error.'
        }
    },
    {
        id: '75',
        category: 'advanced',
        title: { it: 'Palindromo', en: 'Palindrome' },
        description: {
            it: 'Leggi un numero o una parola e verifica se è palindromo (si legge uguale nei due sensi).',
            en: 'Read a number or word and check if it is a palindrome (reads the same both ways).'
        }
    },
    {
        id: '76',
        category: 'advanced',
        title: { it: 'Numeri di Armstrong', en: 'Armstrong Numbers' },
        description: {
            it: 'Verifica se un numero di 3 cifre è di Armstrong (somma dei cubi delle cifre uguale al numero).',
            en: 'Check if a 3-digit number is an Armstrong number (sum of the cubes of its digits equals the number).'
        }
    },
    {
        id: '77',
        category: 'advanced',
        title: { it: 'Tutti i divisori', en: 'All Divisors' },
        description: {
            it: 'Dato un numero, stampa tutti i suoi divisori in ordine crescente.',
            en: 'Given a number, print all its divisors in increasing order.'
        }
    },
    {
        id: '78',
        category: 'advanced',
        title: { it: 'Fattorizzazione', en: 'Prime Factorization' },
        description: {
            it: 'Scomponi un numero in fattori primi e visualizzali.',
            en: 'Factorize a number into prime factors and display them.'
        }
    },
    {
        id: '79',
        category: 'advanced',
        title: { it: 'Indovina il Numero', en: 'Guess the Number' },
        description: {
            it: 'Simula un gioco dove il programma genera un numero e l\'utente deve indovinarlo con indizi "più alto/più basso".',
            en: 'Simulate a game where the program generates a number and the user must guess it with "higher/lower" clues.'
        }
    },
    {
        id: '80',
        category: 'advanced',
        title: { it: 'Sort Semplice (Bubble Sort Logico)', en: 'Simple Sort (Logical Bubble Sort)' },
        description: {
            it: 'Leggi tre numeri e stampali in ordine crescente usando solo confronti e scambi.',
            en: 'Read three numbers and print them in increasing order using only comparisons and swaps.'
        }
    },
    {
        id: '81',
        category: 'advanced',
        title: { it: 'Media pesata', en: 'Weighted Average' },
        description: {
            it: 'Leggi una serie dei voti e i relativi crediti, calcola la media pesata del libretto.',
            en: 'Read a series of grades and their credits, calculate the weighted average.'
        }
    },
    {
        id: '82',
        category: 'advanced',
        title: { it: 'Esponente di Mersenne', en: 'Mersenne Exponent' },
        description: {
            it: 'Verifica se un numero è nella forma 2^n - 1.',
            en: 'Verification if a number is in the form 2^n - 1.'
        }
    },
    {
        id: '83',
        category: 'advanced',
        title: { it: 'Calcolo di PI (Leibniz)', en: 'PI Calculation (Leibniz)' },
        description: {
            it: 'Approssima il valore di PI greco usando la serie di Leibniz fino al termine N.',
            en: 'Approximate the value of PI using the Leibniz series up to term N.'
        }
    },
    {
        id: '84',
        category: 'advanced',
        title: { it: 'Sequenza di Collatz', en: 'Collatz Conjecture' },
        description: {
            it: 'Dato un numero n, se è pari dividi per 2, se è dispari moltiplica per 3 e aggiungi 1. Ripeti fino a 1.',
            en: 'Given n, if even divide by 2, if odd multiply by 3 and add 1. Repeat until reaching 1.'
        }
    },
    {
        id: '85',
        category: 'advanced',
        title: { it: 'Numeri Amici', en: 'Amicable Numbers' },
        description: {
            it: 'Verifica se due numeri sono "amici" (la somma dei divisori di uno è uguale all\'altro e viceversa).',
            en: 'Check if two numbers are "amicable" (the sum of divisors of one equals the other and vice versa).'
        }
    },
    {
        id: '86',
        category: 'advanced',
        title: { it: 'Conversione decimale-esadecimale', en: 'Decimal-Hexadecimal conversion' },
        description: {
            it: 'Converti un numero decimale in esadecimale (gestisci le lettere A-F).',
            en: 'Convert a decimal number to hexadecimal (handle letters A-F).'
        }
    },
    {
        id: '87',
        category: 'advanced',
        title: { it: 'Simulazione Bancomat', en: 'ATM Simulation' },
        description: {
            it: 'Crea un menu con Saldo, Prelievo e Deposito con controlli sui fondi disponibili.',
            en: 'Create a menu with Balance, Withdrawal, and Deposit with checks on available funds.'
        }
    },
    {
        id: '88',
        category: 'advanced',
        title: { it: 'Ricerca Binaria Logica', en: 'Logical Binary Search' },
        description: {
            it: 'Simula il processo di ricerca di un numero in un range riducendo sempre a metà l\'intervallo.',
            en: 'Simulate searching for a number in a range by always halving the interval.'
        }
    },
    {
        id: '89',
        category: 'advanced',
        title: { it: 'Calcolo delle Combinazioni', en: 'Combinations Calculation' },
        description: {
            it: 'Dati n e k, calcola il coefficiente binomiale usando i fattoriali.',
            en: 'Given n and k, calculate the binomial coefficient using factorials.'
        }
    },
    {
        id: '90',
        category: 'advanced',
        title: { it: 'Numeri di Smith', en: 'Smith Numbers' },
        description: {
            it: 'Verifica se la somma delle cifre è uguale alla somma delle cifre dei suoi fattori primi.',
            en: 'Check if the sum of its digits equals the sum of the digits of its prime factors.'
        }
    },
    {
        id: '91',
        category: 'advanced',
        title: { it: 'Radice Cubica Approssimata', en: 'Approximate Cube Root' },
        description: {
            it: 'Usa il metodo di Newton per trovare la radice cubica di un numero.',
            en: 'Use Newton\'s method to find the cube root of a number.'
        }
    },
    {
        id: '92',
        category: 'advanced',
        title: { it: 'Validatore Codice Fiscale (Semplice)', en: 'Tax ID Validator (Simple)' },
        description: {
            it: 'Controlla se la lunghezza e il formato base di una stringa inserita rispettano le regole (es. 16 caratteri).',
            en: 'Check if the length and basic format of an entered string respect the rules (e.g., 16 characters).'
        }
    },
    {
        id: '93',
        category: 'advanced',
        title: { it: 'Sequenza di Fibonacci fino a X', en: 'Fibonacci Sequence up to X' },
        description: {
            it: 'Stampa tutti i numeri della serie di Fibonacci che sono minori di un valore X inserito.',
            en: 'Print all Fibonacci numbers smaller than an entered value X.'
        }
    },
    {
        id: '94',
        category: 'advanced',
        title: { it: 'Sconto a Scaglioni', en: 'Bracketed Discount' },
        description: {
            it: 'Calcola il prezzo: i primi 100€ sono pieni, da 100 a 500 sono scontati del 10%, oltre i 500 del 20%.',
            en: 'Calculate price: first 100€ full price, 100-500 discounted 10%, over 500 discounted 20%.'
        }
    },
    {
        id: '95',
        category: 'advanced',
        title: { it: 'MCD di tre numeri', en: 'GCD of three numbers' },
        description: {
            it: 'Trova il Massimo Comun Divisore tra tre numeri diversi.',
            en: 'Find the Greatest Common Divisor among three different numbers.'
        }
    },
    {
        id: '96',
        category: 'advanced',
        title: { it: 'Cronometro (Simulazione)', en: 'Stopwatch Simulation' },
        description: {
            it: 'Leggi i secondi totali e stampali nel formato HH:MM:SS.',
            en: 'Read total seconds and print them in HH:MM:SS format.'
        }
    },
    {
        id: '97',
        category: 'advanced',
        title: { it: 'Calcolo Area Poligono Regolare', en: 'Regular Polygon Area Calculation' },
        description: {
            it: 'Dato il numero di lati e la lunghezza di un lato, calcola l\'area.',
            en: 'Given the number of sides and side length, calculate the area.'
        }
    },
    {
        id: '98',
        category: 'advanced',
        title: { it: 'Trova Secondi Massimi', en: 'Find Second Max' },
        description: {
            it: 'Leggi una serie di numeri e trova il secondo valore più grande mai inserito.',
            en: 'Read a series of numbers and find the second largest value entered.'
        }
    },
    {
        id: '99',
        category: 'advanced',
        title: { it: 'Somma Cifre Recursiva', en: 'Recursive Digit Sum' },
        description: {
            it: 'Somma le cifre di un numero fino a ridurle ad una sola cifra (radice digitale).',
            en: 'Sum the digits of a number until reduced to a single digit (digital root).'
        }
    },
    {
        id: '100',
        category: 'advanced',
        title: { it: 'Numero Fortunato', en: 'Lucky Number' },
        description: {
            it: 'Verifica se la somma delle cifre in posizione pari è uguale alla somma di quelle in posizione dispari.',
            en: 'Check if the sum of digits in even positions equals the sum of those in odd positions.'
        }
    }
];
