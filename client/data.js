segment1 = `
[ Damage Control ] at [ Facebook: ] 6
[ Takeaways ] From The [ Times’s ]
[ Investigation ]
For more than a [ year ] , [ Facebook ] has endured [ cascading crises ] — over [ Russian
misinformation ] , [ data privacy ] and [ abusive content ] — that transformed the [ Silicon
Valley icon ] into an [ embattled giant ] accused of [ corporate overreach ]
and [ negligence ] .
    An [ investigation ] by [ The New York Times ] revealed how [ Facebook ] fought back
against its [ critics ] : with [ delays ] , [ denials ] and a [ full-bore campaign ] in [ Washington ] .
    Here are six [ takeaways ] .
`
segment2 = `
    [ Facebook ] knew about [ Russian interference ]
In [ fall 2016 ] , [ Mark Zuckerberg ] , [ Facebook’s ] [ chief executive ] , was publicly declaring
[ it ] a [ “crazy idea” ] that [ his ] [ company ] had played a [ role ] in deciding the [ election ] . But
[ security experts ] at the [ company ] already knew otherwise.
    [ They ] found [ signs ] as early as [ spring 2016 ] that [ Russian hackers ] were poking
around the [ Facebook accounts ] of [ people ] linked to [ American presidential
campaigns ] . Months later, [ they ] saw [ Russian-controlled accounts ] sharing
[ information ] from hacked [ Democratic emails ] with [ reporters ] . [ Facebook ]
accumulated [ evidence ] of [ Russian activity ] for over a [ year ] before [ executives ] opted
to share what [ they ] knew with the [ public ] — and even [ their ] own [ board of directors ] .
`
segment3 = `
The [ company ] feared [ Trump supporters ]
In [ 2015 ] , when the [ presidential candidate ] [ Donald J. Trump ] called for a ban of
[ Muslim immigrants ] , [ Facebook employees ] and [ outside critics ] called on the
[ company ] to punish [ Mr. Trump ] . [ Mr. Zuckerberg ] considered it — asking
[ subordinates ] whether [ Mr. Trump ] had violated the [ company’s ] [ rules ] and whether
[ his ] [ account ] should be suspended or the [ post ] removed.
    But while [ Mr. Zuckerberg ] was personally offended, [ he ] deferred to [ subordinates ]
[ who ] warned that penalizing [ Mr. Trump ] would set off a [ damaging backlash ] among
[ Republicans ] .
`

matcher = [
    [
        ['damage control'],
        ['Facebook', 'Silicon Valley Icon', 'embattled giant'],
        ['Takeaways', 'takeaways'],
        ["Time's", 'The New York Times'],
        ['Investigation', 'investigation'],
        ['year'],
        ['cascading crises'],
        ['Russian misinformation'],
        ['data privacy'],
        ['abusive content'],
        ['corporate overreach'],
        ['negligence'],
        ['critics'],
        ['delays'],
        ['denials'],
        ['full-bore campaign'],
        ['Washington']
    ], [
        ['Facebook', "Facebook's", 'company', 'They', 'they'],
        ['Russian interference', 'it', 'crazy idea'],
        ['fall 2016'],
        ['Mark Zuckerberg', 'chief executive', 'his'],
        ['role'],
        ['election'],
        ['security experts'],
        ['signs', 'evidence'],
        ['Russian hackers'],
        ['Facebook accounts'],
        ['people', 'public'],
        ['American presidential campaigns'],
        ['Russian-controlled accounts'],
        ['information'],
        ['Democratic emails'],
        ['reporters'],
        ['Russian activity'],
        ['executives', 'they', 'their'],
        ['board of directors']
    ], [
        ['company', "company's", 'facebook'],
        ['Trump supporters'],
        ['presidential candidates', 'Donald J Trump', 'Mr Trump', 'his'],
        ['Muslim immigrants'],
        ['Facebook employees', 'subordinates', 'who'],
        ['outside critics'],
        ['company'],
        ['Mr Zuckerberg', 'he'],
        ['rules'],
        ['account'],
        ['post'],
        ['damaging backlash'],
        ['Republicans']
    ]
];
