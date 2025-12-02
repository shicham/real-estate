<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Card
        </h2>
        <p class="text-muted-foreground">
          Displays a card with header, content, and footer.
        </p>
      </div>
      <div class="flex gap-2">
        <Badge variant="secondary" class="rounded-full" as-child>
          <NuxtLink
            to="https://www.shadcn-vue.com/docs/components/card"
            external
            target="_blank"
          >
            Component Source
            <Icon name="tabler:arrow-up-right" />
          </NuxtLink>
        </Badge>
      </div>
    </div>
    <div class="flex flex-col gap-4 md:flex-row">
      <Card class="w-full md:w-1/2">
        <CardHeader>
          <CardTitle>Featured</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="w-full flex items-center justify-center gap-4 overflow-hidden">
            <Card class="w-full md:w-[350px]">
              <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>Deploy your new project in one-click.</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div class="grid w-full items-center gap-4">
                    <div class="flex flex-col space-y-1.5">
                      <Label for="name">Name</Label>
                      <Input id="name" placeholder="Name of your project" />
                    </div>
                    <div class="flex flex-col space-y-1.5">
                      <Label for="framework">Framework</Label>
                      <Select>
                        <SelectTrigger id="framework">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="nuxt">
                            Nuxt.js
                          </SelectItem>
                          <SelectItem value="next">
                            Next.js
                          </SelectItem>
                          <SelectItem value="sveltekit">
                            SvelteKit
                          </SelectItem>
                          <SelectItem value="astro">
                            Astro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter class="flex justify-between">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button>Deploy</Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
      <Card class="custom-card w-full md:w-1/2 text-center">
        <CardHeader>
          <CardTitle>Featured</CardTitle>
        </CardHeader>
        <CardContent>
          <h6 class="text-lg font-medium mb-2">
            Breaking News !
          </h6>
          <p class="mb-4">
            With supporting text below as a natural lead-in to additional content.
          </p>
          <Button>Primary</Button>
          <Button variant="outlinesecondary">
            Link
          </Button>
        </CardContent>
        <CardFooter>
          11.32pm
        </CardFooter>
      </Card>
      <Card class="custom-card w-full md:w-1/2">
        <CardHeader>
          <div class="flex w-100">
            <div class="mr-[1.5rem]">
              <Avatar class="w-[3rem] h-[3rem]">
                <AvatarImage src="https://preview.sprukomarket.com/html/bootstrap/vyzor/dist/assets/images/faces/12.jpg" alt="Colm Tuite" />
                <AvatarFallback>CT</AvatarFallback>
              </Avatar>
            </div>
            <div class="flex align-items-center justify-content-between w-100 flex-wrap">
              <div class="mr-[1rem]">
                <p class="text-muted mb-0">
                  Posts
                </p>
                <p class="font-medium text-base mb-0">
                  25
                </p>
              </div>
              <div class="mr-[1rem]">
                <p class="text-muted mb-0">
                  Followers
                </p>
                <p class="font-medium text-base mb-0">
                  1253
                </p>
              </div>
              <div class="mr-[1rem]">
                <p class="text-muted mb-0">
                  Following
                </p>
                <p class="font-medium text-base mb-0">
                  367
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="font-medium text-base">
            Angelina Caprio
          </div>
          <div class="text-muted text-11 mb-4">
            Angular Developer
          </div>
          <p class="text-sm font-medium mb-1">
            About:
          </p>
          <p class="mb-0 ">
            Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped>

</style>
