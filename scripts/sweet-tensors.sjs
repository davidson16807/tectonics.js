

syntax tensor = ( function() {

  let length_lookup = { 
    a:#`la`, b:#`lb`, c:#`lc`, d:#`ld`, e:#`le`, f:#`lf`, g:#`lg`, h:#`lh`, i:#`li`, 
    j:#`lj`, k:#`lk`, l:#`ll`, m:#`lm`, n:#`ln`, o:#`lo`, p:#`lp`, q:#`lq`, r:#`lr`, 
    s:#`ls`, t:#`lt`, u:#`lu`, v:#`lv`, w:#`lw`, x:#`lx`, y:#`ly`, z:#`lz`, 
  };
  let temp_variables = [
    #`$a`, #`$b`, #`$c`, #`$d`, #`$e`, #`$f`, #`$g`, #`$h`, #`$i`, 
    #`$j`, #`$k`, #`$l`, #`$m`, #`$n`, #`$o`, #`$p`, #`$q`, #`$r`, 
    #`$s`, #`$t`, #`$u`, #`$v`, #`$w`, #`$x`, #`$y`, #`$z`, 
  ]
  let operators = ['+','-','*','/',',','.','&','|','%','&&','||'];

  // check for any token that can belong to an indexible expression
  // an indexible expression is for instance "this.foo[i].getBar()[j]"
  let isIndexible = function(token) {
    return  token.isBrackets() || 
            token.isParens() || 
            token.isIdentifier() || 
            token.val() === '.';
  }

  let isTensorIndex = function(token, subtokens) {
    return  token.isBrackets() &&
            subtokens.length === 1 && 
            length_lookup[subtokens[0].val()] !== void 0;
  }

  // returns all tokens to the end of the file or block, whichever comes first
  let tokenize = function(ctx) {
    let tokens = [];
    let token;
    while(token = ctx.next().value){
      tokens.push(token)
    }
    ctx.reset();
    return tokens;
  }

  let parse_statement = function(tokens, pos){
    let binary = ['=','.','+','-','/','*','%','<','>','&','|','^','&&','||','~','<<','>>','>>>'];
    let unary = ['++', '--'];
    let statement = [];

    let token, prev_token;
    let line, prev_line;
    for (let i = pos; i < tokens.length; i++) {
      token = tokens[i];
      
      line = token.lineNumber();

      if (line !== prev_line && 
          prev_line !== void 0 &&
         !token.isDelimiter() && 
          binary.indexOf(token.val()) === -1 && 
          binary.indexOf(prev_token.val()) === -1 && 
          unary.indexOf(prev_token.val()) === -1){
              break;
      }
      
      prev_line  = line;
      prev_token = token;
      statement.push(token);
      
      if(token.val() === ';') break;
    }
    return statement;
  } // end parse_statement()

  // returns all tokens to the end of the file or block, whichever comes first
  let parse_statements = function(tokens) {
    let statements = [];
    for (let i=0; i < tokens.length; ) {
      let statement = parse_statement(tokens, i);
      statements.push(statements);
      i += statement.length;
    }
    return statements;
  }

  let consume_tokens = function(ctx, tokens){
    let token;
    for (var i = 0; i < tokens.length; i++) {
      if(!ctx.next()) {
        break;
      }
    }
  }


  let tokens_hash = function(tokens) {
    return tokens.map(token => token.val()).join('');
  }
  let Multidict = {
    add: function(multidict, key, added) {
      multidict[key] = multidict[key] || [];
      multidict[key].push(added);
    }
  }
  let Multiset = {
    add: function(multiset, added) {
      multiset[added] = multiset[added] || 0;
      multiset[added]++;
    }
  }

  let get_indices = function(tokens, indices, indices_to_indexible, indexible_counts) {
    if(indices === void 0)           indices = {};
    if(indices_to_indexible === void 0) indices_to_indexible = {};
    if(indexible_counts === void 0)      indexible_counts = {};

    let subtokens = [];
    let last_indexible = [];

    for (var i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      if (token.isDelimiter()){
        subtokens = tokenize(token.inner());
        get_indices(subtokens, indices, indices_to_indexible, indexible_counts);
      }
      
      // check for tensor index within []
      if (isTensorIndex(token, subtokens)){
          let index = subtokens[0];
          indices[index.val()] = index;
          Multidict.add(indices_to_indexible, index.val(), last_indexible.slice(0));
          Multiset.add(indexible_counts, tokens_hash(last_indexible));
      }
      
      // compile a list of array values formed over multiple tokens,
      //  e.g. this.foo[i].getBar()[j]
      if (isIndexible(token)) {
          last_indexible.push(token);
      } else {
          last_indexible = [];
      }
    }
    return Object.keys(indices);
  }

  let Indexible = {
  has_no_parens: function(array) {
      return !array.some(token => token.isParens());
    },
  has_no_brackets: function(array) {
      return !array.some(token => token.isBrackets());
    },
  is_not_reevaluated: function(array) {
      return array.length === 1;
    },
  is_independant: function(array) {
      return get_indices(array).length === 0;
    },
  is_dependant_on_index: function(array, i) {
      return get_indices(array).indexOf(i) !== -1;
    },
  is_dependant_on_indices: function(array, indices) {
      return indices.some(i => get_indices(array).indexOf(i) !== -1);
    }   
  };
  let TokenArray = {};
  TokenArray.indexOf = function (match, tokens, from_index) {
      loop: for (let i = from_index >>> 0, li = tokens.length + 1 - jl; i<li; i++) {
          for (let j=0, jl = match.length; j<jl; j++)
              if (tokens[i+j] !== match[j])
                  continue loop;
          return i;
      }
      return -1;
  }
  TokenArray.replace = function (replaced, replacement, within) {
    let index = 0;
    let i = 0;
    let tokens = within.slice(0);
    while (true){
      index = TokenArray.indexOf(replaced, tokens, index);
      //for (i = 0, li = index !== -1? index : tokens.length; i < li; i++){
      //  let token = tokens[i];
      //  if(token.isDelimiter()){
    //    let subtokens = tokenize(token.inner());
    //    subtokens = TokenArray.replace(replaced, replacement, subtokens);
    //    token = #`${subtokens}`;
    //    tokens[i] = token;
      //  }
      //}
      if (index !== -1) {
        tokens = [
          // ...tokens.slice(0, index), 
          // ...replacement, 
          // ...tokens.slice(index + replaced.length)
        ];
        break;
      } 
    } ;

    return tokens;
  }

  let is_index_independant = function(i, indices_to_indexible) {
    return indices_to_indexible[i].some(Indexible.is_independant);
  }
  let is_index_dependant_on_index = function(i, j, indices_to_indexible) {
    return indices_to_indexible[i]
            .some(array =>  Indexible.is_dependant_on_index(array, j));
  }
  let is_index_dependant_on_indices = function(i, indices, indices_to_indexible) {
    return indices_to_indexible[i]
            .some(array =>  Indexible.is_dependant_on_indices(array, indices));
  }

  return function (ctx) {
    let indices = {};
    let filtered_indices_to_indexible = {};
    let indices_to_indexible = {};
    let indexible_counts = {};

    //gather tokens and decide whether code block is single statement or curly-bracketed
    let tokens = tokenize(ctx);
    let consumed;
    if(tokens[0].isBraces()){
      consumed = [tokens[0]];
      tokens = tokenize(tokens[0].inner());
    } else {
      tokens = parse_statement( tokens, 0 );
      consumed = tokens;
    }

    consume_tokens(ctx, consumed);

    get_indices(tokens, indices, indices_to_indexible, indexible_counts);
    get_indices(tokens, {}, filtered_indices_to_indexible, {});

    let index_strs = Object.keys(indices).slice(0);

    // clean up indices_to_indexible
    for (let index_str of index_strs){
      // don't refer to indexibles with parens if you can help it
      let indexibles_sans_parens = filtered_indices_to_indexible[index_str]
        .filter( Indexible.has_no_parens );
      if (indexibles_sans_parens.length > 0) filtered_indices_to_indexible[index_str] = indexibles_sans_parens;

      // don't refer to indexibles with brackets if you can help it
      let indexibles_sans_brackets = filtered_indices_to_indexible[index_str]
        .filter( Indexible.has_no_brackets );
      if (indexibles_sans_brackets.length > 0) filtered_indices_to_indexible[index_str] = indexibles_sans_brackets;

      // don't refer to indexibles with dependencies if you can help it
      let indexibles_sans_indices = filtered_indices_to_indexible[index_str]
        .filter( Indexible.is_independant );
      if (indexibles_sans_indices.length > 0) filtered_indices_to_indexible[index_str] = indexibles_sans_indices;

      // don't refer to indexibles with more than one token if you can help it
      let indexibles_not_reevaluated = filtered_indices_to_indexible[index_str]
        .filter( Indexible.is_not_reevaluated );
      if (indexibles_not_reevaluated.length > 0) filtered_indices_to_indexible[index_str] = indexibles_not_reevaluated;

    }

    // determine the order needed to nest the loops 
    // order is determined based upon dependency
    // see readme for more info
    let independant_indices = index_strs
      .filter( i => filtered_indices_to_indexible[i].some(Indexible.is_independant) );
    let index_strs_sorted = independant_indices;  
    let remaining_indices = index_strs
      .filter( i => independant_indices.indexOf(i) === -1 );

    while (remaining_indices.length > 0) {
      let dependant_indices = remaining_indices
        .filter( i => filtered_indices_to_indexible[i]
                        .some(indexible =>  Indexible.is_dependant_on_indices(indexible, index_strs_sorted) &&
                                       !Indexible.is_dependant_on_indices(indexible, remaining_indices) )  );
      remaining_indices = remaining_indices
        .filter( i => dependant_indices.indexOf(i) === -1 );
      index_strs_sorted = [].concat(dependant_indices, index_strs_sorted);
    };

    // wrap the code block in one for loop for each index
    let loop = #`${tokens}`;
    for (let index_str of index_strs_sorted){
      let index = indices[index_str];
      let length = length_lookup[index_str];
      let indexibles = filtered_indices_to_indexible[index_str];

      let indexible = indexibles.sort((a,b) => a.length - b.length)[0];

      loop = #`for(var ${index}=0, ${length}=${indexible}.length; ${index} < ${length}; ${index}++) { ${loop} }`;
    }
    
    return loop;
  }
})();


