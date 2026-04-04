<?php
function validateData($connection ,$data, $type = 'value'){
    if(is_string($data)){
        $data = trim($data);
        $escaped = pg_escape_string($connection,$data);
        if(count(explode(" ",$data)) == 1  && $type == 'value') return "'".$escaped."'";
        elseif (count(explode(" ",$data)) == 1  && $type == 'colum') return '"'.$escaped.'"';
    }
    elseif(is_array($data)){
        return implode(', ', array_map(function($value) use ($type , $connection) {
            if($type == 'value') return "'" . pg_escape_string($connection,$value) . "'";
            elseif ($type == 'colum') return '"'.pg_escape_string($connection,$value).'"';
        }, $data));
    }
}

function checkDataLength($val1, $val2){
    if(is_string($val1)) $val1 = explode(' ',trim($val1));
    if(is_string($val2)) $val2 = explode(' ',trim($val2));
    return count($val1) == count($val2);
}