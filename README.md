# Internal Analytics

Nesse projeto você encontrará uma maneira simples e eficaz de coletar algumas métricas de acessos as funcionalidades utilizando apenas o backstage sem a necessidade de um aplicação terceira para coleta envio e consulta de dados.

# Executando a aplicação para testes

Para executar a aplicação disponibilizada no repositório e conseguir reproduzir a análise de métricar é necessário realizar algumas alteração.

Primeiramente precisamos de um banco postgres isso pode ser configurado da seguinte forma

## Criação do banco postgres

### Secret

Exemplo de `postgres-secret.yaml` :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
data:
  # A senha precisa estar em Base64.
  # O valor abaixo é o resultado de: echo -n 'sua-senha-super-segura' | base64
  postgres-password: c3VhLXNlbmhhLXN1cGVyLXNlZ3VyYQ==
```

### Persistent Volume Claim

Exemplo de `postgres-pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  # ReadWriteOnce significa que o volume pode ser montado como leitura/escrita por um único nó.
  # Isso é padrão e adequado para um banco de dados single-instance.
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      # Solicita 5 Gigabytes de armazenamento. Ajuste conforme necessário.
      storage: 5Gi
```

### Deployment

Exemplo de `postgres-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15 # Use uma versão de imagem estável
          imagePullPolicy: "IfNotPresent"
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: "meubanco"
            - name: POSTGRES_USER
              value: "meuusuario"
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  # O nome do Secret que criamos
                  name: postgres-secret
                  # A chave dentro do Secret que contém a senha
                  key: postgres-password
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgres-storage
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            # O nome do PVC que criamos
            claimName: postgres-pvc
```

### Service

Exemplo de `postgres-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  type: ClusterIP # Padrão. Expõe o serviço apenas dentro do cluster.
  selector:
    # Este seletor direciona o tráfego para os Pods com a label 'app: postgres'
    app: postgres
  ports:
    - protocol: TCP
      port: 5432       # A porta pela qual o serviço será acessado
      targetPort: 5432 # A porta no contêiner para onde o tráfego será enviado
```

### Realizar o apply

kubectl apply -f postgres-secret.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
kubectl apply -f postgres-service.yaml

### Realizar o port-forward

kubectl get pods

kubectl port-forward podName 5432:5432


## Inicialização do backstage

Executar o comando `yarn install`

Executar o build dos workspaces

`yarn workspace @raphanogueira/plugin-analytics-internal-module build`

`yarn workspace @raphanogueira/plugin-analytics-internal-backend build`

`yarn workspace @raphanogueira/plugin-analytics-internal-frontend build`

Executar o backstage com `yarn start`


## Configuração do usuário

No arquivo [org.yaml](./examples/org.yaml) alterar as seguintes informações

|Campo|Valor|Descrição|
|User.Metadata.Name| your-github-name | Utilizar o seu nome de usuário no github |
|User.Metadata.Title| Your Completed Name| Utilizar seu nome completo |
|User.Spec.Profile.DisplayName| Your Completed Name | Utilizar seu nome completo |
|User.Spec.Profile.Email| your-email@email.com | Utilizar seu email do github |


No arquivo [app-config.yaml](app-config.yaml) realizar as seguintes alterações

|Campo|Valor|Descrição|
|${GITHUB_CLIENT_ID}| [GitHubClientId](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) | Client Id gerada dentro do seu OAuth App no GitHub |
|${GITHUB_CLIENT_SECRET}| [GitHubClientSecret](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) | Secret gerada dentro do seu OAuth App no GitHub |
