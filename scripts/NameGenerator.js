var corpus = [
// " earth ",
// " gaia ",
// " terra ",
" venus ",
" jupiter ",
" uranus ",
" neptune ",
" ceres ",
" eris ",
" palas ",
" vesta ",
" ganymede ",
" calisto ",
" mimas ",
// " enceladus ",
" dione ",
" hyperion ",
" iapetus ",
" apophis ",
" phoebe ",
" miranda ",
" ariel ",
// " umbriel ",
" titania ",
" oberon ",
// " proteus ",
" triton ",
" nereid ",
" phobos ",
" deimos ",
" achelous ",
" achelousaether ",
" alastor ",
" apolo ",
" ares ",
" aristaeus ",
" asclepius ",
// " atlas ",
" atis ",
" boreas ",
" caerus ",
" castor ",
" caerus ",
" chaos ",
" charon ",
" cronos ",
" crios ",
" dinlas ",
" dionysus ",
" erebus ",
" eros ",
" eurus ",
" glaucus ",
" hades ",
" helios ",
" heracles ",
" hermes ",
" hesperus ",
" hymenaios ",
" hypnos ",
" kratos ",
" momus ",
" morpheus ",
" nereus ",
" notus ",
" oceanus ",
" palas ",
" phosphorus ",
" // plutus ",
" polux ",
" pontus ",
" poseidon ",
" priapus ",
" pricus ",
" prometheus ",
" tartarus ",
" thanatos ",
" triton ",
" typhon ",
" uranus ",
" zelus ",
" zephyrus ",
" zeus ",
" europe ",
" asia ",
" africa ",
" america ",
" australia ",
// " antarctica ",
// " pangaia ",
" rodinia ",
// " columbia ",
" laurentia ",
" laurasia ",
" euramerica ",
" gondwana ",
" pannotia ",
" avalonia ",
" atlantica ",
// " arctica ",
" baltica ",
" india ",
" arabia ",
" siberia ",
" amazonia ",
" florida ",
// " virginia ",
// " pennsylvania ",
" indiana ",
" arizona ",
" nevada ",
" montana ",
// " california ",
]
var NameGenerator = {};
var NameGenerator.random_weighted_choice = function(spec) {
  var i, j, table=[];
  for (i in spec) {
    // The constant 10 below should be computed based on the
    // weights in the spec for a correct and optimal table size.
    // E.g. the spec {0:0.999, 1:0.001} will break this impl.
    for (j=0; j<spec[i]*10; j++) {
      table.push(i);
    }
  }
  return function() {
    return table[Math.floor(Math.random() * table.length)];
  }
}
var NameGenerator.get_markov_model = function(corpus) {
	var mappings = {};
	for (var i = 0; i < corpus.length; i++) {
		text = corpus[i]
		weights = {}
		for (var j = 0; j < text.length-1; j++) {
			start = text[j]
			stop  = text[j+1]
			mappings[start] 		= mappings[start] 		|| {};
			mappings[start][stop] 	= mappings[start][stop]	|| 0;
			mappings[start][stop] += 1;
		}
	}
	var markov_model = {};
	for (var start in mappings){
		markov_model[start] = random_weighted_choice(mappings[start])
	}
	return markov_model;
}

var NameGenerator.generate = function(markov_model) {
	var start=' '
	var stop=''
	var text=''
	for (var i = 0; i < 20 && stop != ' '; i++) {
		stop = markov_model[start]();
		text += stop;
		start = stop;
	}
	return text.trim()	
}

var NameGenerator.generate_sensible = function(markov_model, min, max) {
	var text='';
	for (var i = 0; 
		 i < 25 && 
		 (text.length >= max || 
		  text.length <= min) ; i++) {
		text = generate(markov_model);
	}
	console.log(i)
	return text;
}