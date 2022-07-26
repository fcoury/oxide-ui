object
  = begin_object
    members:(
      head:member tail:(value_separator m:member { return m; })* value_separator?
      {
        var result = {};
        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });
        return result;
      }
    )?
    end_object
    {
    return members !== null ? members : {};
    }

member
   = name:key name_separator value:leaf_value {
      return { name: name, value: value };
    }

begin_array     = _ "[" _
begin_object    = _ "{" _
end_array       = _ "]" _
end_object      = _ "}" _
name_separator  = _ ":" _
value_separator = _ "," _

key
  = double_quote_key
  / single_quote_key
  / naked_key

naked_key
	= key:([^\x00:{}]*) { return key.join(''); }

single_quote_key
	= single_quote_mark key:([^\x00':]*) single_quote_mark { return key.join(''); }

double_quote_key
	= quotation_mark key:([^\x00":]*) quotation_mark { return key.join(''); }

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

leaf_value
  = false
  / null
  / true
  / object
  / array
  / number
  / single_quote_string
  / string

quotation_mark = '"'
single_quote_mark = "'"
_ "whitespace" = [ \t\n\r]*

/** String */

string "string"
  = quotation_mark chars:char* quotation_mark
  { return chars.join(""); }

single_quote_string "single_quote_string"
  = single_quote_mark chars:char* single_quote_mark
  { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '"'
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG)
      { return String.fromCharCode(parseInt(digits, 16)); }
    )
    { return sequence; }

escape         = "\\"
unescaped      = [^\0-\x1F\x22\x27\x5C]

/** Number */

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

number_positive
  = int frac? exp? { return parseFloat(text()); }

decimal_point = "."
digit1_9      = [1-9]
e             = [eE]
exp           = e (minus / plus)? DIGIT+
frac          = decimal_point DIGIT+
int           = zero / (digit1_9 DIGIT*)
minus         = "-"
plus          = "+"
zero          = "0"

DIGIT  = [0-9]
HEXDIG = [0-9a-f]i

/** Array */

array
  = begin_array
    values:(
      head:leaf_value tail:(value_separator v:leaf_value { return v; })* value_separator?
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }
