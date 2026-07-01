const VIEW_CYCLE = ["split", "edit", "preview"];
const VIEW_LABELS = { split: "Split", edit: "Edit", preview: "Preview" };

let editor;
let viewMode = "split";
const currentNoteId = window.location.pathname.substring(1);

const EMOJI_MAP = {
  "+1":"👍","-1":"👎","100":"💯","1234":"🔢","1st_place_medal":"🥇","2nd_place_medal":"🥈",
  "3rd_place_medal":"🥉","8ball":"🎱","a":"🅰️","ab":"🆎","abacus":"🧮","abc":"🔤",
  "abcd":"🔡","accept":"🉑","adhesive_bandage":"🩹","adult":"🧑","aerial_tramway":"🚡",
  "airplane":"✈️","alarm_clock":"⏰","alembic":"⚗️","alien":"👽","ambulance":"🚑",
  "anchor":"⚓","angel":"👼","anger":"💢","angry":"😠","anguished":"😧","ant":"🐜",
  "apple":"🍎","aquarius":"♒","aries":"♈","arrow_backward":"◀️","arrow_double_down":"⏬",
  "arrow_double_up":"⏫","arrow_down":"⬇️","arrow_down_small":"🔽","arrow_forward":"▶️",
  "arrow_heading_down":"⤵️","arrow_heading_up":"⤴️","arrow_left":"⬅️","arrow_lower_left":"↙️",
  "arrow_lower_right":"↘️","arrow_right":"➡️","arrow_right_hook":"↪️","arrow_up":"⬆️",
  "arrow_up_down":"↕️","arrow_up_small":"🔼","arrow_upper_left":"↖️","arrow_upper_right":"↗️",
  "arrows_clockwise":"🔃","arrows_counterclockwise":"🔄","art":"🎨","articulated_lorry":"🚛",
  "astonished":"😲","athletic_shoe":"👟","atm":"🏧","atom_symbol":"⚛️","avocado":"🥑",
  "b":"🅱️","baby":"👶","baby_bottle":"🍼","baby_chick":"🐤","baby_symbol":"🚼",
  "back":"🔙","bacon":"🥓","badger":"🦡","badminton":"🏸","bagel":"🥯","baggage_claim":"🛄",
  "balloon":"🎈","ballot_box":"🗳️","bamboo":"🎍","banana":"🍌","bangbang":"‼️",
  "bank":"🏦","bar_chart":"📊","barber":"💈","baseball":"⚾","basket":"🧺",
  "basketball":"🏀","bat":"🦇","bath":"🛀","bathtub":"🛁","battery":"🔋",
  "beach_umbrella":"🏖️","bear":"🐻","bearded_person":"🧔","bed":"🛏️","bee":"🐝",
  "beer":"🍺","beers":"🍻","beetle":"🐞","beginner":"🔰","bell":"🔔","bellhop_bell":"🛎️",
  "bento":"🍱","bike":"🚲","bikini":"👙","billed_cap":"🧢","bird":"🐦",
  "birthday":"🎂","black_circle":"⚫","black_heart":"🖤","black_joker":"🃏",
  "black_square_button":"🔲","blossom":"🌼","blowfish":"🐡","blue_book":"📘",
  "blue_car":"🚙","blue_heart":"💙","blush":"😊","boar":"🐗","boat":"⛵","bomb":"💣",
  "bone":"🦴","book":"📖","bookmark":"🔖","bookmark_tabs":"📑","books":"📚",
  "boom":"💥","boot":"👢","bouquet":"💐","bow":"🙇","bow_and_arrow":"🏹",
  "bowl_with_spoon":"🥣","bowling":"🎳","boxing_glove":"🥊","boy":"👦","brain":"🧠",
  "bread":"🍞","bride_with_veil":"👰","bridge_at_night":"🌉","briefcase":"💼",
  "broccoli":"🥦","broken_heart":"💔","broom":"🧹","brown_heart":"🤎","bug":"🐛",
  "building_construction":"🏗️","bulb":"💡","bullettrain_front":"🚅","bullettrain_side":"🚄",
  "burrito":"🌯","bus":"🚌","busstop":"🚏","bust_in_silhouette":"👤",
  "busts_in_silhouette":"👥","butterfly":"🦋","cactus":"🌵","cake":"🍰",
  "calendar":"📆","calling":"📲","camel":"🐫","camera":"📷","camera_flash":"📸",
  "camping":"🏕️","cancer":"♋","candle":"🕯️","candy":"🍬","canned_food":"🥫",
  "canoe":"🛶","capital_abcd":"🔠","capricorn":"♑","car":"🚗","card_file_box":"🗃️",
  "card_index":"📇","card_index_dividers":"🗂️","carousel_horse":"🎠","carrot":"🥕",
  "cat":"🐱","cat2":"🐈","cd":"💿","chains":"⛓️","chair":"🪑","champagne":"🍾",
  "chart":"💹","chart_with_downwards_trend":"📉","chart_with_upwards_trend":"📈",
  "checkered_flag":"🏁","cheese":"🧀","cherries":"🍒","cherry_blossom":"🌸",
  "chess_pawn":"♟️","chestnut":"🌰","chicken":"🐔","child":"🧒","children_crossing":"🚸",
  "chipmunk":"🐿️","chocolate_bar":"🍫","chopsticks":"🥢","christmas_tree":"🎄",
  "church":"⛪","cinema":"🎦","circus_tent":"🎪","city_sunrise":"🌇","city_sunset":"🌆",
  "cityscape":"🏙️","cl":"🆑","clap":"👏","clapper":"🎬","classical_building":"🏛️",
  "clinking_glasses":"🥂","clipboard":"📋","clock1":"🕐","clock10":"🕙","clock1030":"🕥",
  "clock11":"🕚","clock1130":"🕦","clock12":"🕛","clock1230":"🕧","clock130":"🕜",
  "clock2":"🕑","clock230":"🕝","clock3":"🕒","clock330":"🕞","clock4":"🕓",
  "clock430":"🕟","clock5":"🕔","clock530":"🕠","clock6":"🕕","clock630":"🕡",
  "clock7":"🕖","clock730":"🕢","clock8":"🕗","clock830":"🕣","clock9":"🕘",
  "clock930":"🕤","closed_book":"📕","closed_lock_with_key":"🔐",
  "closed_umbrella":"🌂","cloud":"☁️","cloud_with_lightning":"🌩️",
  "cloud_with_lightning_and_rain":"⛈️","cloud_with_rain":"🌧️","cloud_with_snow":"🌨️",
  "clown":"🤡","clubs":"♣️","cn":"🇨🇳","coat":"🧥","cocktail":"🍸","coconut":"🥥",
  "coffee":"☕","coffin":"⚰️","cold_face":"🥶","cold_sweat":"😰","comet":"☄️",
  "compass":"🧭","computer":"💻","confetti_ball":"🎊","confounded":"😖","confused":"😕",
  "congratulations":"㊗️","construction":"🚧","construction_worker":"👷","control_knobs":"🎛️",
  "convenience_store":"🏪","cookie":"🍪","cool":"🆒","cop":"👮","copyright":"©️",
  "corn":"🌽","couch_and_lamp":"🛋️","couple":"👫","couple_with_heart":"💑",
  "cow":"🐮","cow2":"🐄","crab":"🦀","credit_card":"💳","crescent_moon":"🌙",
  "cricket":"🦗","cricket_game":"🏏","crocodile":"🐊","croissant":"🥐",
  "crossed_fingers":"🤞","crossed_flags":"🎌","crossed_swords":"⚔️","crown":"👑",
  "cry":"😢","crying_cat_face":"😿","crystal_ball":"🔮","cucumber":"🥒",
  "cup_with_straw":"🥤","cupcake":"🧁","curling_stone":"🥌","curly_loop":"➰",
  "currency_exchange":"💱","curry":"🍛","custard":"🍮","customs":"🛃",
  "cut_of_meat":"🥩","cyclone":"🌀","dagger":"🗡️","dancer":"💃","dancers":"👯",
  "dango":"🍡","dark_sunglasses":"🕶️","dart":"🎯","dash":"💨","date":"📅",
  "de":"🇩🇪","deaf_person":"🧏","deciduous_tree":"🌳","deer":"🦌",
  "department_store":"🏬","derelict_house":"🏚️","desert":"🏜️","desert_island":"🏝️",
  "desktop_computer":"🖥️","detective":"🕵️","diamond_shape_with_a_dot_inside":"💠",
  "diamonds":"♦️","disappointed":"😞","disappointed_relieved":"😥","diving_mask":"🤿",
  "dizzy":"💫","dizzy_face":"😵","dna":"🧬","do_not_litter":"🚯","dog":"🐶",
  "dog2":"🐕","dollar":"💵","dolls":"🎎","dolphin":"🐬","door":"🚪",
  "doughnut":"🍩","dove":"🕊️","dragon":"🐉","dragon_face":"🐲","dress":"👗",
  "dromedary_camel":"🐪","drooling_face":"🤤","drop_of_blood":"🩸","droplet":"💧",
  "drum":"🥁","duck":"🦆","dumpling":"🥟","dvd":"📀","e-mail":"📧","eagle":"🦅",
  "ear":"👂","ear_of_rice":"🌾","earth_africa":"🌍","earth_americas":"🌎",
  "earth_asia":"🌏","egg":"🥚","eggplant":"🍆","eight_pointed_black_star":"✴️",
  "eight_spoked_asterisk":"✳️","electric_plug":"🔌","elephant":"🐘",
  "elf":"🧝","email":"✉️","end":"🔚","envelope":"✉️","envelope_with_arrow":"📩",
  "es":"🇪🇸","euro":"💶","european_castle":"🏰","european_post_office":"🏤",
  "evergreen_tree":"🌲","exclamation":"❗","exploding_head":"🤯","expressionless":"😑",
  "eye":"👁️","eyeglasses":"👓","eyes":"👀","facepalm":"🤦","factory":"🏭",
  "fairy":"🧚","falafel":"🧆","fallen_leaf":"🍂","family":"👪","fast_forward":"⏩",
  "fax":"📠","fearful":"😨","feet":"🐾","female_sign":"♀️","ferris_wheel":"🎡",
  "ferry":"⛴️","field_hockey":"🏑","file_cabinet":"🗄️","file_folder":"📁",
  "film_projector":"📽️","fire":"🔥","fire_engine":"🚒","fire_extinguisher":"🧯",
  "fireworks":"🎆","first_quarter_moon":"🌓","first_quarter_moon_with_face":"🌛",
  "fish":"🐟","fish_cake":"🍥","fishing_pole_and_fish":"🎣","fist":"✊",
  "flags":"🎏","flamingo":"🦩","flashlight":"🔦","fleur_de_lis":"⚜️",
  "flight_arrival":"🛬","flight_departure":"🛫","flipper":"🐬","floppy_disk":"💾",
  "flower_playing_cards":"🎴","flushed":"😳","flying_disc":"🥏","flying_saucer":"🛸",
  "fog":"🌫️","foggy":"🌁","football":"🏈","footprints":"👣","fork_and_knife":"🍴",
  "fortune_cookie":"🥠","fountain":"⛲","fountain_pen":"🖋️","four_leaf_clover":"🍀",
  "fox":"🦊","fr":"🇫🇷","frame_photo":"🖼️","free":"🆓","fried_egg":"🍳",
  "fried_shrimp":"🍤","fries":"🍟","frog":"🐸","frowning":"😦","fuelpump":"⛽",
  "full_moon":"🌕","full_moon_with_face":"🌝","funeral_urn":"⚱️","game_die":"🎲",
  "garlic":"🧄","gb":"🇬🇧","gear":"⚙️","gem":"💎","gemini":"♊","genie":"🧞",
  "ghost":"👻","gift":"🎁","gift_heart":"💝","giraffe":"🦒","girl":"👧",
  "globe_with_meridians":"🌐","gloves":"🧤","goal_net":"🥅","goat":"🐐",
  "goggles":"🥽","golf":"⛳","gorilla":"🦍","grapes":"🍇","green_apple":"🍏",
  "green_book":"📗","green_heart":"💚","green_salad":"🥗","grey_exclamation":"❕",
  "grey_question":"❔","grimacing":"😬","grin":"😁","grinning":"😀","guard":"💂",
  "guide_dog":"🦮","guitar":"🎸","gun":"🔫","haircut":"💇","hamburger":"🍔",
  "hammer":"🔨","hammer_and_pick":"⚒️","hammer_and_wrench":"🛠️","hamster":"🐹",
  "hand":"✋","hand_over_mouth":"🤭","handbag":"👜","handball":"🤾","handshake":"🤝",
  "hankey":"💩","hash":"#️⃣","hatched_chick":"🐥","hatching_chick":"🐣",
  "headphones":"🎧","hear_no_evil":"🙉","heart":"❤️","heart_decoration":"💟",
  "heart_eyes":"😍","heart_eyes_cat":"😻","heartbeat":"💓","heartpulse":"💗",
  "hearts":"♥️","heavy_check_mark":"✔️","heavy_division_sign":"➗",
  "heavy_dollar_sign":"💲","heavy_heart_exclamation":"❣️","heavy_minus_sign":"➖",
  "heavy_multiplication_x":"✖️","heavy_plus_sign":"➕","hedgehog":"🦔",
  "helicopter":"🚁","herb":"🌿","hibiscus":"🌺","high_brightness":"🔆",
  "high_heel":"👠","hiking_boot":"🥾","hindu_temple":"🛕","hippopotamus":"🦛",
  "hocho":"🔪","hole":"🕳️","honey_pot":"🍯","horse":"🐴","horse_racing":"🏇",
  "hospital":"🏥","hot_face":"🥵","hot_pepper":"🌶️","hotdog":"🌭","hotel":"🏨",
  "hotsprings":"♨️","hourglass":"⌛","hourglass_flowing_sand":"⏳","house":"🏠",
  "house_with_garden":"🏡","houses":"🏘️","hugs":"🤗","hushed":"😯","ice_cream":"🍨",
  "ice_cube":"🧊","ice_hockey":"🏒","ice_skate":"⛸️","icecream":"🍦","id":"🆔",
  "ideograph_advantage":"🉐","imp":"👿","inbox_tray":"📥","incoming_envelope":"📨",
  "infinity":"♾️","information_source":"ℹ️","innocent":"😇","interrobang":"⁉️",
  "iphone":"📱","it":"🇮🇹","izakaya_lantern":"🏮","jack_o_lantern":"🎃",
  "japan":"🗾","japanese_castle":"🏯","japanese_goblin":"👺","japanese_ogre":"👹",
  "jeans":"👖","jigsaw":"🧩","joy":"😂","joy_cat":"😹","joystick":"🕹️",
  "jp":"🇯🇵","juggling":"🤹","kaaba":"🕋","kangaroo":"🦘","key":"🔑",
  "keyboard":"⌨️","keycap_ten":"🔟","kimono":"👘","kiss":"💋","kissing":"😗",
  "kissing_cat":"😽","kissing_closed_eyes":"😚","kissing_heart":"😘",
  "kissing_smiling_eyes":"😙","kite":"🪁","kiwi_fruit":"🥝","knife":"🔪",
  "koala":"🐨","koko":"🈁","kr":"🇰🇷","lab_coat":"🥼","label":"🏷️",
  "lacrosse":"🥍","large_blue_diamond":"🔷","large_orange_diamond":"🔶",
  "last_quarter_moon":"🌗","last_quarter_moon_with_face":"🌜","laughing":"😆",
  "leafy_green":"🥬","leaves":"🍃","ledger":"📒","left_luggage":"🛅",
  "left_right_arrow":"↔️","left_speech_bubble":"🗨️","leftwards_arrow_with_hook":"↩️",
  "lemon":"🍋","leo":"♌","leopard":"🐆","level_slider":"🎚️","libra":"♎",
  "light_rail":"🚈","link":"🔗","lion":"🦁","lips":"👄","lipstick":"💄",
  "lizard":"🦎","llama":"🦙","lobster":"🦞","lock":"🔒","lock_with_ink_pen":"🔏",
  "lollipop":"🍭","loop":"➿","lotion_bottle":"🧴","loud_sound":"🔊",
  "loudspeaker":"📢","love_hotel":"🏩","love_letter":"💌","love_you_gesture":"🤟",
  "low_brightness":"🔅","luggage":"🧳","lying_face":"🤥","m":"Ⓜ️",
  "mag":"🔍","mag_right":"🔎","mage":"🧙","magnet":"🧲","mahjong":"🀄",
  "mailbox":"📫","mailbox_closed":"📪","mailbox_with_mail":"📬",
  "mailbox_with_no_mail":"📭","male_sign":"♂️","man":"👨","man_dancing":"🕺",
  "mango":"🥭","mans_shoe":"👞","manual_wheelchair":"🦽","maple_leaf":"🍁",
  "martial_arts_uniform":"🥋","mask":"😷","massage":"💆","mate":"🧉",
  "meat_on_bone":"🍖","mechanical_arm":"🦾","mechanical_leg":"🦿","medal_military":"🎖️",
  "medal_sports":"🏅","medical_symbol":"⚕️","mega":"📣","melon":"🍈","memo":"📝",
  "menorah":"🕎","mens":"🚹","mermaid":"🧜‍♀️","merman":"🧜‍♂️","merperson":"🧜",
  "metal":"🤘","metro":"🚇","microbe":"🦠","microphone":"🎤","microscope":"🔬",
  "middle_finger":"🖕","milk_glass":"🥛","milky_way":"🌌","minibus":"🚐",
  "minidisc":"💽","mobile_phone_off":"📴","money_mouth":"🤑","money_with_wings":"💸",
  "moneybag":"💰","monkey":"🐒","monkey_face":"🐵","monorail":"🚝","moon":"🌔",
  "moon_cake":"🥮","mortar_board":"🎓","mosque":"🕌","mosquito":"🦟",
  "motor_boat":"🛥️","motor_scooter":"🛵","motorcycle":"🏍️","motorized_wheelchair":"🦼",
  "motorway":"🛣️","mount_fuji":"🗻","mountain":"⛰️","mountain_cableway":"🚠",
  "mountain_railway":"🚞","mouse":"🐭","mouse2":"🐁","movie_camera":"🎥",
  "moyai":"🗿","mrs_claus":"🤶","muscle":"💪","mushroom":"🍄","musical_keyboard":"🎹",
  "musical_note":"🎵","musical_score":"🎼","mute":"🔇","nail_care":"💅",
  "name_badge":"📛","national_park":"🏞️","nauseated_face":"🤢","nazar_amulet":"🧿",
  "necktie":"👔","negative_squared_cross_mark":"❎","nerd":"🤓","neutral_face":"😐",
  "new":"🆕","new_moon":"🌑","new_moon_with_face":"🌚","newspaper":"📰",
  "ng":"🆖","night_with_stars":"🌃","nine":"9️⃣","ninja":"🥷","no_bell":"🔕",
  "no_bicycles":"🚳","no_entry":"⛔","no_entry_sign":"🚫","no_good":"🙅",
  "no_mobile_phones":"📵","no_mouth":"😶","no_pedestrians":"🚷","no_smoking":"🚭",
  "non-potable_water":"🚱","nose":"👃","notebook":"📓","notebook_with_decorative_cover":"📔",
  "notes":"🎶","nut_and_bolt":"🔩","o":"⭕","o2":"🅾️","ocean":"🌊",
  "octopus":"🐙","oden":"🍢","office":"🏢","oil_drum":"🛢️","ok":"🆗",
  "ok_hand":"👌","ok_woman":"🙆","old_key":"🗝️","older_adult":"🧓",
  "older_man":"👴","older_woman":"👵","om":"🕉️","on":"🔛","oncoming_automobile":"🚘",
  "oncoming_bus":"🚍","oncoming_police_car":"🚔","oncoming_taxi":"🚖",
  "one_piece_swimsuit":"🩱","onion":"🧅","open_book":"📖","open_file_folder":"📂",
  "open_hands":"👐","open_mouth":"😮","open_umbrella":"☂️","ophiuchus":"⛎",
  "orange_book":"📙","orange_heart":"🧡","orangutan":"🦧","orthodox_cross":"☦️",
  "otter":"🦦","outbox_tray":"📤","owl":"🦉","ox":"🐂","oyster":"🦪",
  "package":"📦","page_facing_up":"📄","page_with_curl":"📃","pager":"📟",
  "paintbrush":"🖌️","palm_tree":"🌴","palms_up_together":"🤲","pancakes":"🥞",
  "panda_face":"🐼","paperclip":"📎","paperclips":"🖇️","parachute":"🪂",
  "parking":"🅿️","parrot":"🦜","part_alternation_mark":"〽️","partly_sunny":"⛅",
  "partying_face":"🥳","passenger_ship":"🛳️","passport_control":"🛂",
  "peace_symbol":"☮️","peach":"🍑","peacock":"🦚","peanuts":"🥜","pear":"🍐",
  "pen":"🖊️","pencil2":"✏️","penguin":"🐧","pensive":"😔","people_holding_hands":"🧑‍🤝‍🧑",
  "performing_arts":"🎭","persevere":"😣","person_biking":"🚴","person_bowing":"🙇",
  "person_climbing":"🧗","person_doing_cartwheel":"🤸","person_frowning":"🙍",
  "person_in_lotus_position":"🧘","person_in_steamy_room":"🧖","person_juggling":"🤹",
  "person_kneeling":"🧎","person_mountain_biking":"🚵","person_rowing":"🚣",
  "person_running":"🏃","person_standing":"🧍","person_surfing":"🏄",
  "person_swimming":"🏊","person_walking":"🚶","person_wearing_turban":"👳",
  "person_with_probing_cane":"🧑‍🦯","petri_dish":"🧫","phone":"☎️","pick":"⛏️",
  "pie":"🥧","pig":"🐷","pig2":"🐖","pig_nose":"🐽","pill":"💊","pinching_hand":"🤏",
  "pineapple":"🍍","ping_pong":"🏓","pirate_flag":"🏴‍☠️","pisces":"♓",
  "pizza":"🍕","place_of_worship":"🛐","pleading_face":"🥺","point_down":"👇",
  "point_left":"👈","point_right":"👉","point_up":"☝️","point_up_2":"👆",
  "police_car":"🚓","police_officer":"👮","poodle":"🐩","popcorn":"🍿",
  "post_office":"🏣","postal_horn":"📯","postbox":"📮","potable_water":"🚰",
  "potato":"🥔","pouch":"👝","poultry_leg":"🍗","pound":"💷","pout":"😡",
  "pray":"🙏","prayer_beads":"📿","pregnant_woman":"🤰","pretzel":"🥨",
  "prince":"🤴","princess":"👸","printer":"🖨️","probing_cane":"🦯","purple_heart":"💜",
  "purse":"👛","pushpin":"📌","put_litter_in_its_place":"🚮","question":"❓",
  "rabbit":"🐰","rabbit2":"🐇","raccoon":"🦝","racehorse":"🐎","racing_car":"🏎️",
  "radio":"📻","radio_button":"🔘","radioactive":"☢️","rage":"😡","railway_car":"🚃",
  "rainbow":"🌈","rainbow_flag":"🏳️‍🌈","raised_back_of_hand":"🤚","raised_hand":"✋",
  "raised_hands":"🙌","raising_hand":"🙋","ram":"🐏","ramen":"🍜","rat":"🐀",
  "razor":"🪒","receipt":"🧾","recycle":"♻️","red_car":"🚗","red_circle":"🔴",
  "red_envelope":"🧧","registered":"®️","relaxed":"☺️","relieved":"😌",
  "reminder_ribbon":"🎗️","repeat":"🔁","repeat_one":"🔂","restroom":"🚻",
  "revolving_hearts":"💞","rewind":"⏪","rhinoceros":"🦏","ribbon":"🎀",
  "rice":"🍚","rice_ball":"🍙","rice_cracker":"🍘","rice_scene":"🎑",
  "right_anger_bubble":"🗯️","ring":"💍","ringed_planet":"🪐","robot":"🤖",
  "rocket":"🚀","roll_of_paper":"🧻","rolled_up_newspaper":"🗞️","roller_coaster":"🎢",
  "rolling_eyes":"🙄","rooster":"🐓","rose":"🌹","rosette":"🏵️",
  "rotating_light":"🚨","round_pushpin":"📍","ru":"🇷🇺","rugby_football":"🏉",
  "runner":"🏃","running_shirt_with_sash":"🎽","sa":"🈂️","safety_pin":"🧷",
  "safety_vest":"🦺","sagittarius":"♐","sailboat":"⛵","sake":"🍶","salt":"🧂",
  "sandal":"👡","sandwich":"🥪","santa":"🎅","sari":"🥻","satellite":"📡",
  "sauropod":"🦕","saxophone":"🎷","scales":"⚖️","scarf":"🧣","school":"🏫",
  "school_satchel":"🎒","scissors":"✂️","scooter":"🛴","scorpion":"🦂",
  "scorpius":"♏","scream":"😱","scream_cat":"🙀","scroll":"📜","seat":"💺",
  "secret":"㊙️","see_no_evil":"🙈","seedling":"🌱","selfie":"🤳","service_dog":"🐕‍🦺",
  "seven":"7️⃣","shallow_pan_of_food":"🥘","shamrock":"☘️","shark":"🦈",
  "shaved_ice":"🍧","sheep":"🐑","shell":"🐚","shield":"🛡️",
  "shinto_shrine":"⛩️","ship":"🚢","shirt":"👕","shopping":"🛍️",
  "shopping_cart":"🛒","shorts":"🩳","shower":"🚿","shrimp":"🦐",
  "shushing_face":"🤫","signal_strength":"📶","six_pointed_star":"🔯",
  "skateboard":"🛹","ski":"🎿","skier":"⛷️","skull":"💀","skull_and_crossbones":"☠️",
  "sled":"🛷","sleeping":"😴","sleeping_bed":"🛌","sleepy":"😪","slightly_smiling_face":"🙂",
  "slot_machine":"🎰","sloth":"🦥","small_airplane":"🛩️","small_blue_diamond":"🔹",
  "small_orange_diamond":"🔸","small_red_triangle":"🔺",
  "small_red_triangle_down":"🔻","smile":"😄","smile_cat":"😸","smiley":"😃",
  "smiley_cat":"😺","smiling_face_with_three_hearts":"🥰","smiling_imp":"😈",
  "smirk":"😏","smirk_cat":"😼","smoking":"🚬","snail":"🐌","snake":"🐍",
  "sneezing_face":"🤧","snow_capped_mountain":"🏔️","snowboarder":"🏂",
  "snowflake":"❄️","snowman":"⛄","snowman_with_snow":"☃️","soap":"🧼",
  "sob":"😭","soccer":"⚽","socks":"🧦","softball":"🥎","soon":"🔜",
  "sos":"🆘","sound":"🔉","space_invader":"👾","spades":"♠️","spaghetti":"🍝",
  "sparkle":"❇️","sparkler":"🎇","sparkles":"✨","sparkling_heart":"💖",
  "speak_no_evil":"🙊","speaker":"🔈","speaking_head":"🗣️","speech_balloon":"💬",
  "speedboat":"🚤","spider":"🕷️","spider_web":"🕸️","spiral_calendar":"🗓️",
  "spiral_notepad":"🗒️","sponge":"🧽","spoon":"🥄","squid":"🦑","stadium":"🏟️",
  "star":"⭐","star2":"🌟","star_and_crescent":"☪️","star_of_david":"✡️",
  "stars":"🌠","station":"🚉","statue_of_liberty":"🗽","steam_locomotive":"🚂",
  "stethoscope":"🩺","stew":"🍲","stop_sign":"🛑","stopwatch":"⏱️",
  "straight_ruler":"📏","strawberry":"🍓","stuck_out_tongue":"😛",
  "stuck_out_tongue_closed_eyes":"😝","stuck_out_tongue_winking_eye":"😜",
  "studio_microphone":"🎙️","stuffed_flatbread":"🥙","sun_behind_large_cloud":"🌥️",
  "sun_behind_rain_cloud":"🌦️","sun_behind_small_cloud":"🌤️","sun_with_face":"🌞",
  "sunflower":"🌻","sunglasses":"😎","sunny":"☀️","sunrise":"🌅",
  "sunrise_over_mountains":"🌄","superhero":"🦸","supervillain":"🦹","surfer":"🏄",
  "sushi":"🍣","suspension_railway":"🚟","swan":"🦢","sweat":"😓",
  "sweat_drops":"💦","sweat_smile":"😅","sweet_potato":"🍠","swimmer":"🏊",
  "symbols":"🔣","synagogue":"🕍","syringe":"💉","t-rex":"🦖","taco":"🌮",
  "tada":"🎉","takeout_box":"🥡","tanabata_tree":"🎋","tangerine":"🍊",
  "taurus":"♉","taxi":"🚕","tea":"🍵","teddy_bear":"🧸","telephone":"📞",
  "telephone_receiver":"📞","telescope":"🔭","tennis":"🎾","tent":"⛺",
  "test_tube":"🧪","thermometer":"🌡️","thinking":"🤔","thought_balloon":"💭",
  "thread":"🧵","three":"3️⃣","ticket":"🎫","tickets":"🎟️","tiger":"🐯",
  "tiger2":"🐅","timer_clock":"⏲️","tired_face":"😫","tm":"™️","toilet":"🚽",
  "tokyo_tower":"🗼","tomato":"🍅","tongue":"👅","toolbox":"🧰","tooth":"🦷",
  "top":"🔝","tophat":"🎩","tornado":"🌪️","trackball":"🖲️","tractor":"🚜",
  "traffic_light":"🚥","train":"🚋","train2":"🚆","tram":"🚊",
  "triangular_flag_on_post":"🚩","triangular_ruler":"📐","trident":"🔱",
  "triumph":"😤","trolleybus":"🚎","trophy":"🏆","tropical_drink":"🍹",
  "tropical_fish":"🐠","truck":"🚚","trumpet":"🎺","tulip":"🌷","tumbler_glass":"🥃",
  "turkey":"🦃","turtle":"🐢","tv":"📺","twisted_rightwards_arrows":"🔀",
  "two":"2️⃣","two_hearts":"💕","two_men_holding_hands":"👬",
  "two_women_holding_hands":"👭","u5272":"🈹","u5408":"🈴","u55b6":"🈺",
  "u6307":"🈯","u6708":"🈷️","u6709":"🈶","u6e80":"🈵","u7121":"🈚",
  "u7533":"🈸","u7981":"🈲","u7a7a":"🈳","umbrella":"☔",
  "unamused":"😒","underage":"🔞","unicorn":"🦄","unlock":"🔓","up":"🆙",
  "upside_down":"🙃","us":"🇺🇸","v":"✌️","vampire":"🧛","vertical_traffic_light":"🚦",
  "vhs":"📼","vibration_mode":"📳","video_camera":"📹","video_game":"🎮",
  "violin":"🎻","virgo":"♍","volcano":"🌋","volleyball":"🏐","vs":"🆚",
  "waffle":"🧇","walking":"🚶","waning_crescent_moon":"🌘","waning_gibbous_moon":"🌖",
  "warning":"⚠️","wastebasket":"🗑️","watch":"⌚","water_buffalo":"🐃",
  "water_polo":"🤽","watermelon":"🍉","wave":"👋","wavy_dash":"〰️",
  "waxing_crescent_moon":"🌒","wc":"🚾","weary":"😩","wedding":"💒",
  "whale":"🐳","whale2":"🐋","wheel_of_dharma":"☸️","wheelchair":"♿",
  "white_check_mark":"✅","white_circle":"⚪","white_flag":"🏳️",
  "white_flower":"💮","white_heart":"🤍","white_large_square":"⬜",
  "white_medium_small_square":"◽","white_medium_square":"◻️",
  "white_small_square":"▫️","white_square_button":"🔳","wilted_flower":"🥀",
  "wind_chime":"🎐","wind_face":"🌬️","wine_glass":"🍷","wink":"😉",
  "wolf":"🐺","woman":"👩","womans_clothes":"👚","womans_hat":"👒",
  "womens":"🚺","woozy_face":"🥴","world_map":"🗺️","worried":"😟",
  "wrench":"🔧","writing_hand":"✍️","x":"❌","yarn":"🧶","yawning_face":"🥱",
  "yellow_heart":"💛","yen":"💴","yin_yang":"☯️","yum":"😋","zap":"⚡",
  "zebra":"🦓","zero":"0️⃣","zipper_mouth":"🤐","zombie":"🧟","zzz":"💤",
  "shipit":"🚢","trollface":"😈","suspect":"🤨","feelsgood":"😊",
  "finnadie":"😠","goberserk":"😡","godmode":"😇","hurtrealbad":"🤕",
  "rage1":"😤","rage2":"😡","rage3":"🤬","rage4":"😠"
};

let footnotes = [];

marked.setOptions({ gfm: true, breaks: false });

const ALERT_ICONS = {
  note: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>',
  tip: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z"></path></svg>',
  important: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  warning: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg>',
  caution: '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>'
};
const ALERT_TITLES = { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" };

function preprocessAlerts(src) {
  return src.replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gm, (full, typeRaw, bodyRaw) => {
    const type = typeRaw.toLowerCase();
    const innerMd = bodyRaw.split("\n").map(l => l.replace(/^> ?/, "")).join("\n").trimEnd();
    const innerHTML = marked.parse(innerMd);
    return `<div class="markdown-alert markdown-alert-${type}"><p class="markdown-alert-title">${ALERT_ICONS[type]} ${ALERT_TITLES[type]}</p>${innerHTML}</div>`;
  });
}

function preprocessFootnotes(src) {
  footnotes.length = 0;
  src = src.replace(/^\[\^(\w+)\]:\s+([^\n]*\n?)(?:\n(?!\[\^).*)*/gm, (full, id) => {
    const text = full.replace(/^\[\^\w+\]:\s*/, "").trim();
    footnotes.push({ id, text });
    return "";
  });
  return src.replace(/\[\^(\w+)\](?!:)/g, (full, id) =>
    `<sup><a href="#user-content-fn-${id}" id="user-content-fnref-${id}" data-footnote-ref>${id}</a></sup>`
  );
}

function preprocessEmojis(src) {
  return src.replace(/:([\w+-]+):/g, (full, code) => EMOJI_MAP[code] || full);
}

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    "a", "abbr", "b", "blockquote", "br", "caption", "code", "col", "colgroup",
    "dd", "del", "details", "div", "dl", "dt", "em", "fieldset", "figcaption",
    "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "input",
    "ins", "kbd", "legend", "li", "mark", "ol", "p", "picture", "pre", "q",
    "rp", "rt", "ruby", "s", "samp", "section", "small", "source", "span",
    "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th",
    "thead", "tr", "u", "ul", "var", "video", "wbr"
  ],
  ALLOWED_ATTR: [
    "align", "alt", "aria-label", "checked", "cite", "class", "colspan",
    "data-footnote-backref", "data-footnote-ref", "dir", "disabled", "height",
    "href", "id", "lang", "name", "open", "rel", "rowspan", "src", "start",
    "style", "target", "title", "type", "width"
  ],
  ALLOW_ARIA_ATTR: true,
  ALLOW_DATA_ATTR: true
};

function renderFootnotes(html) {
  if (footnotes.length === 0) return html;
  const ol = footnotes.map((f, i) =>
    `<li id="user-content-fn-${f.id}"><p>${marked.parseInline(f.text)} <a href="#user-content-fnref-${f.id}" data-footnote-backref aria-label="Back to content">↩</a></p></li>`
  ).join("");
  return html + `<section data-footnotes class="footnotes"><h2 id="footnotes-label">Footnotes</h2><ol>${ol}</ol></section>`;
}

function applyColorSwatches(html) {
  return html.replace(/<code>(#(?:[0-9a-fA-F]{3}){1,2}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\))<\/code>/g, (match, color) => {
    const c = color.startsWith("#") && color.length === 4 ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}` : color;
    return `<code class="color-swatch" style="--swatch-color:${c}">${color}</code>`;
  });
}

async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers,
  };

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const menuButton = document.getElementById("menu-button");
  const dropdownMenu = document.getElementById("dropdown-menu");

  menuButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      dropdownMenu.classList.add("hidden");
    }
  });

  setupSplitter();

  const textArea = document.getElementById("editor");
  editor = CodeMirror.fromTextArea(textArea, {
    mode: "markdown",
    theme: "one-dark",
    lineNumbers: true,
    lineWrapping: true,
    autofocus: true,
    tabSize: 2,
    indentWithTabs: false,
    viewportMargin: Infinity
  });

  document.querySelectorAll(".light-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const on = btn.classList.toggle("on");
      const panel = btn.dataset.panel;
      toggleLight(btn, panel, on);
    });
  });

  setupEventListeners();
  const noteId = window.location.pathname.substring(1);

  try {
    if (noteId) {
      const response = await fetchAPI(`/${noteId}`);
      const data = await response.json();
      if (data.content) {
        editor.setValue(data.content);
        const mode = data.save_state || "split";
        setMode(mode);
      } else {
        throw new Error("No content received");
      }
    } else {
      const response = await fetchAPI("/");
      const data = await response.json();
      if (data.noteId) {
        window.location.href = `/${data.noteId}`;
        return;
      }
      throw new Error("No noteId received");
    }
  } catch (error) {
    console.error("Failed to initialize note:", error);
    editor.setValue(`Error: ${error.message}`);
    editor.setOption("readOnly", true);
  }
});

function setupEventListeners() {
  const viewButton = document.getElementById("view-button");

  editor.on("change", () => {
    saveNoteContent();
    if (viewMode === "split") renderPreviewContent();
  });

  viewButton.addEventListener("click", () => {
    const idx = VIEW_CYCLE.indexOf(viewMode);
    const next = VIEW_CYCLE[(idx + 1) % 3];
    setMode(next);
    saveModeToDatabase(next);
  });

  document.getElementById("copy-link").addEventListener("click", copyLink);
  document.getElementById("delete-note").addEventListener("click", deleteNote);
  document.getElementById("new-note").addEventListener("click", newNote);
  document.getElementById("clone-note").addEventListener("click", cloneNote);
  document.getElementById("export-note").addEventListener("click", exportNote);
  document.getElementById("show-guide").addEventListener("click", showGuide);

  const guideModal = document.getElementById("guide-modal");
  document.getElementById("close-guide").addEventListener("click", () => guideModal.style.display = "none");
  guideModal.querySelector(".modal-backdrop").addEventListener("click", () => guideModal.style.display = "none");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") guideModal.style.display = "none";
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveNoteContent();
    } else if (event.ctrlKey && event.key === "n") {
      event.preventDefault();
      newNote();
    } else if (event.ctrlKey && event.key === "p") {
      event.preventDefault();
      const idx = VIEW_CYCLE.indexOf(viewMode);
      const next = VIEW_CYCLE[(idx + 1) % 3];
      setMode(next);
      saveModeToDatabase(next);
    }
  });
}

let splitRatio = 0.5;

function toggleLight(btn, panel, on) {
  if (panel === "editor") {
    document.getElementById("editor-container").classList.toggle("light", on);
    editor.setOption("theme", on ? "default" : "one-dark");
  } else {
    document.getElementById("preview-container").classList.toggle("light", on);
  }
  btn.querySelector("i").className = on ? "fas fa-lightbulb" : "far fa-lightbulb";
}

function setupSplitter() {
  const splitter = document.getElementById("splitter");
  const editorContainer = document.getElementById("editor-container");
  const mainContainer = document.getElementById("main-container");
  let dragging = false;

  splitter.addEventListener("mousedown", () => { dragging = true; });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = mainContainer.getBoundingClientRect();
    splitRatio = (e.clientX - rect.left) / rect.width;
    editorContainer.style.flex = `0 0 ${splitRatio * 100}%`;
  });
  document.addEventListener("mouseup", () => {
    if (dragging) editor.refresh();
    dragging = false;
  });
}

function setMode(mode) {
  viewMode = mode;
  applyView();
  localStorage.setItem("editorMode", mode);
}

function applyView() {
  const mainContainer = document.getElementById("main-container");
  const editorContainer = document.getElementById("editor-container");
  const previewContainer = document.getElementById("preview-container");
  const viewButton = document.getElementById("view-button");

  if (viewMode === "split") {
    mainContainer.classList.add("split");
    editorContainer.style.display = "";
    editorContainer.style.flex = `0 0 ${splitRatio * 100}%`;
    previewContainer.style.display = "";
    renderPreviewContent();
  } else if (viewMode === "edit") {
    mainContainer.classList.remove("split");
    editorContainer.style.display = "";
    editorContainer.style.flex = "1";
    previewContainer.style.display = "none";
  } else {
    mainContainer.classList.remove("split");
    editorContainer.style.flex = "1";
    editorContainer.style.display = "none";
    previewContainer.style.display = "";
    renderPreviewContent();
  }

  viewButton.textContent = VIEW_LABELS[viewMode];
  editor.refresh();
}

function renderPreviewContent() {
  const preview = document.getElementById("preview");
  const src = editor.getValue();
  const src1 = preprocessAlerts(src);
  const src2 = preprocessFootnotes(src1);
  const src3 = preprocessEmojis(src2);
  const rawHTML = marked.parse(src3);
  const withColors = applyColorSwatches(rawHTML);
  const withFootnotes = renderFootnotes(withColors);
  const cleanHTML = DOMPurify.sanitize(withFootnotes, DOMPURIFY_CONFIG);
  preview.innerHTML = cleanHTML;
  preview.querySelectorAll("pre code").forEach(block => {
    try { hljs.highlightElement(block); }
    catch (_) {}
  });
}

async function saveModeToDatabase(mode) {
  if (!currentNoteId) return;
  try {
    await fetchAPI(`/${currentNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ save_state: mode }),
    });
  } catch (error) {
    console.error("Failed to save note mode:", error);
  }
}

async function saveNoteContent() {
  if (!currentNoteId) return;
  const content = editor.getValue();
  try {
    await fetchAPI(`/${currentNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ content }),
    });
  } catch (error) {
    console.error("Failed to save note content:", error);
    throw error;
  }
}

function showGuide() {
  document.getElementById("guide-modal").style.display = "flex";
}

function copyLink() {
  if (!currentNoteId) {
    alert("No note to share. Please create or clone a note first.");
    return;
  }
  const url = new URL(window.location);
  const shareableLink = url.toString();
  navigator.clipboard
    .writeText(shareableLink)
    .then(() => {
      alert("Link copied to clipboard!");
    })
    .catch(() => {
      alert("Failed to copy link.");
    });
}

async function deleteNote() {
  if (!currentNoteId) {
    alert("No note to delete.");
    return;
  }
  if (confirm("Are you sure you want to delete this note?")) {
    try {
      await fetchAPI(`/${currentNoteId}`, {
        method: "DELETE",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  }
}

function newNote() {
  window.location.href = "/";
}

async function cloneNote() {
  if (!currentNoteId) {
    alert("No note to clone.");
    return;
  }
  const content = editor.getValue();
  const newNoteId = [...Array(8)]
    .map(() => Math.random().toString(36)[2])
    .join("");
  try {
    await fetchAPI(`/${newNoteId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ content }),
    });
    window.location.href = "/" + newNoteId;
  } catch (error) {
    console.error("Failed to clone note:", error);
    alert("Failed to clone note. Please try again.");
  }
}

function exportNote() {
  if (!currentNoteId) {
    alert("No note to export. Please create or open a note first.");
    return;
  }
  const content = editor.getValue();
  const blob = new Blob([content], { type: "text/markdown" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = currentNoteId + ".md";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
