Clusters
========

Los cluster interfases que arrancan ilos del proceso, permitiendo controlar multiples hilos en tiempo real y valancear correctamente los procesos, para optimizar y evitar la falta de disponivilidad del servicio.



Web service
-----------

Para el control de los cluster CapJS Proporciona una interface (API) para el control de los procesos del sistema.


### Globla Response

SE pueden ver algunas respuestas de forma general dentro del Web Servis.

Codigo de Status:
	-	200: Respuesta correcta sin problemas al general la acción.
	- 500: Error interno del sistema.
	- 404: No existe recurso que se esta buscando.



### [GET]: http://localhost:32020/cluster

Muestra los Workers activos.

```json
{
  "status": "ok",
  "servers": [
    {
      "id": "1",
      "pid": 3388,
      "state": "listening"
    },
    {
      "id": "2",
      "pid": 16072,
      "state": "listening"
    },
    {
      "id": "4",
      "pid": 8099,
      "state": "listening"
    }
  ]
}
```


### [GET]: http://localhost:32020/cluster/fork

Crear un Fork para el servicio.

```json
{
  "status": "success",
  "pid": 6716,
  "state": "none"
}
```



### [GET]: http://localhost:32020/cluster/2

Muestra un worker especifico, que se esta ejecutando.

```json
{
  "pid": 16072,
  "state": "listening"
}
```


### [DELETE]: http://localhost:32020/cluster/2

Elimina el worker especifico.

```json
{
  "state": "killing",
  "pid": 16072,
  "message": "Has kill worker 16072"
}
```




