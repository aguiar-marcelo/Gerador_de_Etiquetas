const express = require('express')
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;
const app = express();
var cors = require('cors')


//funcao que busca os dados no banco
async function selectAllEmployees(req, res) {
  try {
    connection = await oracledb.getConnection({
      user: 'user',
      password: 'senha',
      connectString: 'database' //os parametros de conexão foram alterados para proteger os dados da empresa
    });

    console.clear();
    console.log('conectado ao banco');
    result = await connection.execute(//SQL foi alterado para proteger os dados da empresa
      `
      select ex.cod_empresa as empresa,
      TRIM(emp.den_razao_social) as nome_empresa,
      fun.num_matricula as matricula,
      TRIM(fun.nom_completo) as funcionario,
      TRIM(car.den_cargo) as cargo,
      TRIM(dep.des_grp_uni_fun) as departamento
 from exemplo.funcionario fun,
      exemplo.emp_raz_soc emp,
      exemplo.rhu_grp_x_uni_fun e,
      exemplo.rhu_grp_uni_fun dep,
      exemplo.unidade_funcional g,
      exemplo.cargo car
where fun.dat_demis is null
  and emp.cod_empresa = fun.cod_empresa
  and e.empresa(+) = fun.cod_empresa
  and e.unidade_func(+) = fun.cod_uni_funcio
  and dep.empresa(+) = e.empresa
  and dep.grupo_unidade_func(+) = e.grupo_unidade_func
  and g.cod_empresa(+) = fun.cod_empresa
  and g.cod_uni_funcio(+) = fun.cod_uni_funcio
  and (g.dat_validade_ini <= SYSDATE and g.dat_validade_fim >= SYSDATE)
  and car.cod_empresa = '01'
  and car.cod_cargo = fun.cod_cargo
  and car.dat_validade_ini <= SYSDATE
  and car.dat_validade_fim >= SYSDATE
  and (TRIM(dep.des_grp_uni_fun) <> 'AFASTADOS') )
  order by departamento
`
    );

  } catch (err) {
    //envia mensagem de erro
    return res.send(err.message);
  } finally {
    if (connection) {
      try {
        // fecha a conexao
        await connection.close();
        console.log('desconectado ao banco');
      } catch (err) {
        console.error(err.message);
      }
    }
    if (result.rows.length == 0) {
      return res.send('retornou nenhum registro');
    } else {
      return res.send(result.rows);
    }

  }
}

//a biblioteca CORS que permite que não de o erro "No 'Access-Control-Allow-Origin' "
app.use(cors())

//Cria a rota que gera as etiquetas, metodo get
app.get('/api', function (req, res) {
  selectAllEmployees(req, res);
})

//roda o servidor
app.listen(8081, () => console.log("servidor rodando na porta 8081..."))
