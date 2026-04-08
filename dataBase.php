<?php
require_once 'toolbox.php';
class Database{
    private static $_instance = null;
    private $_connection;

    private function __construct($connect_str) {
        $this->_connection = pg_connect($connect_str);
    }

    public static function instance($connect_str = null) {
        if (self::$_instance === null) {
            if ($connect_str === null) {
                return null;
            }
            self::$_instance = new self($connect_str);
        }
        return self::$_instance;
    }

    public function connection(){
        return $this->_connection;
    }

    public function createNewRecord($tableName , $fields , $values){
        if(checkDataLength($fields , $values)) {
            $fields_str = validateData($this->connection(),$fields, 'colum');
            
            $values_str = validateData($this->connection(),$values, 'value');
            
            $query = "INSERT INTO $tableName ($fields_str) VALUES ($values_str)";
            return pg_query($this->connection(), $query);
        } else {
            return false;
        }
    }

    public function findRecord($tableName , $fields , $condition = null, $limit = null){
        $fields_str = '';
        $query = '';
        if($fields == '*'){
            $query = "SELECT * FROM $tableName";
        }
        else{
            $fields_str = validateData($this->connection(),$fields, "colum");
            $query = "SELECT $fields_str FROM $tableName";
        }
        if($condition !== null){
            $query .= " WHERE $condition";
        }
        if($limit !== null){
            $query .= " LIMIT $limit";
        }
        $result = pg_query($this->connection(), $query);

        $rows = [];
        while ($row = pg_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
}